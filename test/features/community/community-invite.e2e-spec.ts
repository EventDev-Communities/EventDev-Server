import { UserRole } from '@common/enums/roles.enum'
import { PrismaService } from '@db/prisma.service'
import { IAuthAdapter } from '@infrastructure/auth/auth.adapter.interface'
import { EmailService } from '@infrastructure/email/email.service'
import { AppModule } from '@module/app/app.module'
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { deleteUser } from 'supertokens-node'

describe('Community Invite E2E Test', () => {
  let app: INestApplication
  let prismaService: PrismaService
  let authAdapter: IAuthAdapter
  let accessToken: string
  let refreshToken: string

  const adminEmail = `admin-${Date.now()}@test.com`
  const adminPassword = 'AdminPassword123!'

  const mockEmailService = {
    sendInvitationEmail: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true)
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
      .compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

    prismaService = app.get<PrismaService>(PrismaService)
    authAdapter = app.get<IAuthAdapter>('IAuthAdapter')

    await app.init()

    // Clean DB
    await prismaService.communityInvitation.deleteMany()
    await prismaService.community.deleteMany()
    await prismaService.user.deleteMany()

    // Clean SuperTokens Admins to allow bootstrap
    const admins = await authAdapter.getUsersByRole(UserRole.ADMIN)
    await Promise.all(admins.map(async (adminId) => await deleteUser(adminId)))

    // Create Admin User
    const signUpResponse = await authAdapter.signUp(adminEmail, adminPassword)
    if (signUpResponse.status === 'OK' && signUpResponse.user) {
      await authAdapter.addRoleToUser(signUpResponse.user.id, UserRole.ADMIN)
    } else if (signUpResponse.status !== 'EMAIL_ALREADY_EXISTS') {
      console.error('Signup failed:', signUpResponse)
    }

    // Sign In to get tokens
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: adminEmail, password: adminPassword })
      .expect(HttpStatus.OK)

    accessToken = loginResponse.headers['st-access-token']
    refreshToken = loginResponse.headers['st-refresh-token']

    if (!accessToken || !refreshToken) {
      console.error('Login failed, no tokens in headers:', loginResponse.headers)
      throw new Error('Login failed, no tokens received')
    }
  })

  afterAll(async () => {
    await prismaService.$disconnect()
    await app.close()
  })

  it('should invite a community, validate token, and accept invite', async () => {
    const inviteEmail = `invite-${Date.now()}@test.com`

    // 1. Invite
    const inviteResponse = await request(app.getHttpServer())
      .post('/communities/invite')
      .set('st-access-token', accessToken)
      .set('st-refresh-token', refreshToken)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: inviteEmail,
        name: 'Invited Community',
        description: 'Description'
      })
      .expect(HttpStatus.CREATED)

    expect(inviteResponse.body).toHaveProperty('link')
    const link = inviteResponse.body.link
    const token = link.split('token=')[1]
    expect(token).toBeDefined()

    // 2. Validate Token
    const validateResponse = await request(app.getHttpServer())
      .get(`/communities/invite/${token}`)
      .expect(HttpStatus.OK)

    expect(validateResponse.body).toHaveProperty('email', inviteEmail)
    expect(validateResponse.body).toHaveProperty('token', token)
    expect(validateResponse.body).toHaveProperty('isUsed', false)

    // 3. Accept Invite
    const acceptResponse = await request(app.getHttpServer())
      .post('/auth/invite/accept')
      .send({
        token,
        password: 'NewUserPassword123!'
      })
      .expect(HttpStatus.CREATED)

    expect(acceptResponse.body).toHaveProperty('message', 'Convite aceito com sucesso')
    expect(acceptResponse.body).toHaveProperty('userId')

    // 4. Verify DB
    const invitation = await prismaService.communityInvitation.findUnique({
      where: { token }
    })
    expect(invitation).toBeDefined()
    expect(invitation?.isUsed).toBe(true)

    const user = await prismaService.user.findUnique({
      where: { email: inviteEmail }
    })
    expect(user).toBeDefined()

    if (!user) {
      throw new Error('User not found')
    }
    const community = await prismaService.community.findFirst({
      where: { supertokensId: user.supertokensId }
    })
    expect(community).toBeDefined()
    expect(community?.name).toBe('Invited Community')
  })
})
