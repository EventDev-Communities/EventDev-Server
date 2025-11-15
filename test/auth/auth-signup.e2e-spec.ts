import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@prisma/prisma.service'
import request from 'supertest'
import { AppModule } from '@/app.module'

describe('Auth Signup E2E Test', () => {
  let app: INestApplication
  let prismaService: PrismaService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

    prismaService = app.get<PrismaService>(PrismaService)
    await app.init()

    // Limpar comunidades antes
    await prismaService.community.deleteMany()
  }, 30000)

  afterAll(async () => {
    await prismaService.community.deleteMany()
    await prismaService.$disconnect()
    await app.close()
  })

  it('POST /auth/signup/community - should create account', async () => {
    const testEmail = `test-${Date.now()}@test.com`
    const testPassword = 'TestPassword123!'

    const response = await request(app.getHttpServer())
      .post('/auth/signup/community')
      .send({
        email: testEmail,
        password: testPassword,
        name: 'Test Community',
        description: 'Test description',
        logoUrl: 'https://example.com/logo.png',
        role: 'community'
      })
      .expect(HttpStatus.CREATED)

    expect(response.body).toHaveProperty('status', 'OK')
    expect(response.body).toHaveProperty('user_info')
  }, 30000)
})
