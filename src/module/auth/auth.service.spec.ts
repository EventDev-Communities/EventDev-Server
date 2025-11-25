import { UserRole } from '@common/enums/roles.enum'
import { LoggerService } from '@common/logger/logger.service'
import { PrismaService } from '@db/prisma.service'
import { EmailService } from '@infrastructure/email/email.service'
import { AuthService } from '@module/auth/auth.service'
import { CommunityService } from '@module/community/community.service'
import { ConflictException, InternalServerErrorException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { listUsersByAccountInfo } from 'supertokens-node'
import { createResetPasswordToken, resetPasswordUsingToken, signIn as superTokensSignIn, signUp as superTokensSignUp } from 'supertokens-node/recipe/emailpassword'

jest.mock('supertokens-node/recipe/emailpassword', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  createResetPasswordToken: jest.fn(),
  resetPasswordUsingToken: jest.fn()
}))

jest.mock('supertokens-node', () => ({
  convertToRecipeUserId: jest.fn((id) => ({ getAsString: () => id })),
  listUsersByAccountInfo: jest.fn()
}))

jest.mock('supertokens-node/recipe/session', () => ({
  default: {}
}))

describe('AuthService', () => {
  let service: AuthService
  let authAdapter: any
  let communityService: any
  let moduleRef: TestingModule

  const mockAuthAdapter = {
    signIn: jest.fn(),
    signUp: jest.fn(),
    getUserRoles: jest.fn(),
    getUserById: jest.fn(),
    addRoleToUser: jest.fn(),
    getUsersByRole: jest.fn()
  }

  const mockCommunityService = {
    create: jest.fn(),
    getByUserId: jest.fn()
  }

  const mockEmailService = {
    sendPasswordResetEmail: jest.fn()
  }

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }

  const mockPrismaService = {}

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'IAuthAdapter', useValue: mockAuthAdapter },
        { provide: CommunityService, useValue: mockCommunityService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: LoggerService, useValue: mockLoggerService }
      ]
    }).compile()

    service = moduleRef.get<AuthService>(AuthService)
    authAdapter = mockAuthAdapter
    communityService = mockCommunityService

    jest.clearAllMocks()
  })

  afterEach(async () => {
    await moduleRef.close()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('signIn', () => {
    it('should sign in successfully with valid credentials', async () => {
      const signInData = { email: 'user@test.com', password: 'password123' }
      const mockUser = { id: 'user-1', emails: ['user@test.com'] }

        ; (superTokensSignIn as jest.Mock).mockResolvedValue({
        status: 'OK',
        user: mockUser
      })
      authAdapter.getUserRoles.mockResolvedValue([UserRole.USER])

      const mockReq = { res: {} } as any
      const result = await service.signInWithSession(signInData, mockReq)

      expect(result.status).toBe('OK')
      expect(result.user).toEqual({
        id: 'user-1',
        email: 'user@test.com',
        roles: [UserRole.USER]
      })
    })

    it('should throw ConflictException with WRONG_CREDENTIALS status', async () => {
      const signInData = { email: 'user@test.com', password: 'wrongpassword' }
      const mockReq = { res: {} } as any

        ; (superTokensSignIn as jest.Mock).mockResolvedValue({
        status: 'WRONG_CREDENTIALS_ERROR'
      })

      await expect(service.signInWithSession(signInData, mockReq)).rejects.toThrow(ConflictException)
      await expect(service.signInWithSession(signInData, mockReq)).rejects.toThrow('Email ou senha incorretos.')
    })
  })

  describe('signOut', () => {
    it('should return success message', async () => {
      const mockSession = {
        revokeSession: jest.fn().mockResolvedValue(undefined)
      }

      const result = await service.signOut(mockSession as any)

      expect(result.status).toBe('OK')
      expect(result.message).toBe('Logout realizado com sucesso.')
      expect(mockSession.revokeSession).toHaveBeenCalledTimes(1)
    })
  })

  describe('getCurrentUser', () => {
    it('should return current user with roles', async () => {
      const mockSession = {
        getUserId: jest.fn().mockReturnValue('user-123')
      }

      authAdapter.getUserById.mockResolvedValue({
        id: 'user-123',
        email: 'user@test.com',
        roles: [UserRole.USER]
      })

      const result = await service.getCurrentUser(mockSession as any)

      expect(result).toMatchSnapshot()
    })

    it('should throw InternalServerErrorException on failure', async () => {
      const mockSession = {
        getUserId: jest.fn().mockReturnValue('user-123')
      }

      authAdapter.getUserById.mockRejectedValue(new Error('Database error'))

      await expect(service.getCurrentUser(mockSession as any)).rejects.toThrow(InternalServerErrorException)
    })
  })

  describe('createCommunity', () => {
    it('should create community successfully', async () => {
      const communityData = {
        email: 'community@test.com',
        password: 'password123',
        name: 'Test Community',
        logoUrl: '',
        description: '',
        isActive: true,
        githubLink: '',
        instagramLink: '',
        linkedinLink: '',
        websiteLink: '',
        phoneNumber: '',
        role: 'community' as const
      }

      const mockUser = { id: 'user-123', emails: ['community@test.com'] }
      const mockCommunity = { id: 1, name: 'Test Community' }

        ; (superTokensSignUp as jest.Mock).mockResolvedValue({
        status: 'OK',
        user: mockUser
      })
      authAdapter.addRoleToUser.mockResolvedValue(undefined)
      communityService.create.mockResolvedValue(mockCommunity)

      const mockReq = { res: {} } as any
      const result = await service.createCommunityWithSession(communityData, mockReq)

      expect(result.status).toBe('OK')
      expect(result.user_info).toEqual(mockCommunity)
      expect(superTokensSignUp).toHaveBeenCalledWith('public', 'community@test.com', 'password123', undefined, expect.any(Object))
      expect(authAdapter.addRoleToUser).toHaveBeenCalledWith('user-123', UserRole.COMMUNITY)
      expect(communityService.create).toHaveBeenCalled()
    })

    it('should throw ConflictException if email already exists', async () => {
      const communityData = {
        email: 'existing@test.com',
        password: 'password123',
        name: 'Test Community',
        logoUrl: '',
        description: '',
        isActive: true,
        githubLink: '',
        instagramLink: '',
        linkedinLink: '',
        websiteLink: '',
        phoneNumber: '',
        role: 'community' as const
      }

        ; (superTokensSignUp as jest.Mock).mockResolvedValue({
        status: 'EMAIL_ALREADY_EXISTS_ERROR'
      })

      const mockReq = { res: {} } as any
      await expect(service.createCommunityWithSession(communityData, mockReq)).rejects.toThrow(ConflictException)
      await expect(service.createCommunityWithSession(communityData, mockReq)).rejects.toThrow('Este email já está em uso.')
    })
  })

  describe('bootstrapAdmin', () => {
    it('should create first admin successfully', async () => {
      const adminData = {
        email: 'admin@test.com',
        password: 'admin123',
        role: UserRole.ADMIN,
        is_active: true
      }

      const mockUser = { id: 'admin-1', email: 'admin@test.com' }

      authAdapter.getUsersByRole.mockResolvedValue([])
      authAdapter.signUp.mockResolvedValue({
        status: 'OK',
        user: mockUser
      })

      const result = await service.bootstrapAdmin(adminData as any)

      expect(result.status).toBe('OK')
      expect(result.user_info.role).toBe('admin')
      expect(authAdapter.getUsersByRole).toHaveBeenCalledWith(UserRole.ADMIN)
      expect(authAdapter.addRoleToUser).toHaveBeenCalledWith('admin-1', UserRole.ADMIN)
    })

    it('should throw ConflictException if admin already exists', async () => {
      const adminData = {
        email: 'admin@test.com',
        password: 'admin123',
        role: UserRole.ADMIN,
        is_active: true
      }

      authAdapter.getUsersByRole.mockResolvedValue([{ id: 'existing-admin' }])

      await expect(service.bootstrapAdmin(adminData as any)).rejects.toThrow(ConflictException)
      await expect(service.bootstrapAdmin(adminData as any)).rejects.toThrow('Já existe um administrador no sistema.')
    })
  })

  describe('createUser', () => {
    it('should create user successfully when called by admin', async () => {
      const userData = {
        email: 'newuser@test.com',
        password: 'password123',
        role: UserRole.USER,
        is_active: true
      }

      const mockSession = {
        getUserId: jest.fn().mockReturnValue('admin-id')
      }

      const mockUser = { id: 'new-user-id', email: 'newuser@test.com' }

      authAdapter.getUserRoles.mockResolvedValue([UserRole.ADMIN])
      authAdapter.signUp.mockResolvedValue({
        status: 'OK',
        user: mockUser
      })

      const result = await service.createUser(userData as any, mockSession as any)

      expect(result.status).toBe('OK')
      expect(authAdapter.addRoleToUser).toHaveBeenCalledWith('new-user-id', UserRole.USER)
    })

    it('should throw ConflictException if caller is not admin', async () => {
      const userData = {
        email: 'newuser@test.com',
        password: 'password123',
        role: UserRole.USER,
        is_active: true
      }

      const mockSession = {
        getUserId: jest.fn().mockReturnValue('user-id')
      }

      authAdapter.getUserRoles.mockResolvedValue([UserRole.USER])

      await expect(service.createUser(userData as any, mockSession as any)).rejects.toThrow(ConflictException)
      await expect(service.createUser(userData as any, mockSession as any)).rejects.toThrow('Acesso negado. Apenas administradores podem criar usuários.')
    })

    it('should create user without session check if no session provided', async () => {
      const userData = {
        email: 'newuser@test.com',
        password: 'password123',
        role: UserRole.USER,
        is_active: true
      }

      const mockUser = { id: 'new-user-id', email: 'newuser@test.com' }

      authAdapter.signUp.mockResolvedValue({
        status: 'OK',
        user: mockUser
      })

      const result = await service.createUser(userData as any)
      expect(result).toEqual({
        status: 'OK',
        user_info: {
          id: mockUser.id,
          email: mockUser.email,
          role: userData.role
        }
      })
    })
  })

  describe('sendPasswordResetToken', () => {
    it('should return success message if token creation is successful', async () => {
      const email = 'user@test.com'
        ; (listUsersByAccountInfo as jest.Mock).mockResolvedValue([{ id: 'user-id', email }])
      ; (createResetPasswordToken as jest.Mock).mockResolvedValue({
        status: 'OK',
        token: 'reset-token'
      })

      const result = await service.sendPasswordResetToken({ email })

      expect(result).toEqual({ status: 'OK', message: 'Se o email existir, um link de recuperação será enviado.' })
      expect(createResetPasswordToken).toHaveBeenCalledWith('public', 'user-id', email)
    })

    it('should return success message even if user is unknown (security)', async () => {
      const email = 'unknown@test.com'
        ; (listUsersByAccountInfo as jest.Mock).mockResolvedValue([])

      const result = await service.sendPasswordResetToken({ email })

      expect(result).toEqual({ status: 'OK', message: 'Se o email existir, um link de recuperação será enviado.' })
      expect(createResetPasswordToken).not.toHaveBeenCalled()
    })
  })

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const dto = { token: 'valid-token', password: 'newPassword123' }
        ; (resetPasswordUsingToken as jest.Mock).mockResolvedValue({
        status: 'OK'
      })

      const result = await service.resetPassword(dto)

      expect(result).toEqual({ status: 'OK', message: 'Senha alterada com sucesso.' })
      expect(resetPasswordUsingToken).toHaveBeenCalledWith('public', dto.token, dto.password)
    })

    it('should throw ConflictException if token is invalid', async () => {
      const dto = { token: 'invalid-token', password: 'newPassword123' }
        ; (resetPasswordUsingToken as jest.Mock).mockResolvedValue({
        status: 'RESET_PASSWORD_INVALID_TOKEN_ERROR'
      })

      await expect(service.resetPassword(dto)).rejects.toThrow(ConflictException)
    })
  })
})
