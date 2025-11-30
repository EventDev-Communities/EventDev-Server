import { UserRole } from '@common/enums/roles.enum'
import { LoggerService } from '@common/logger/logger.service'
import { PrismaService } from '@db/prisma.service'
import { EmailService } from '@infrastructure/email/email.service'
import { AuthService } from '@module/auth/auth.service'
import { CommunityService } from '@module/community/community.service'
import { ConflictException, InternalServerErrorException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { Request, Response } from 'express'
import { listUsersByAccountInfo } from 'supertokens-node'
import EmailPassword from 'supertokens-node/recipe/emailpassword'
import SessionRecipe from 'supertokens-node/recipe/session'

// Mock SuperTokens
jest.mock('supertokens-node', () => ({
  convertToRecipeUserId: jest.fn().mockReturnValue({}),
  listUsersByAccountInfo: jest.fn()
}))

jest.mock('supertokens-node/recipe/emailpassword', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  createResetPasswordToken: jest.fn(),
  resetPasswordUsingToken: jest.fn()
}))

jest.mock('supertokens-node/recipe/session', () => ({
  createNewSession: jest.fn()
}))

// Mock env
jest.mock('@configs/env', () => ({
  env: jest.fn().mockReturnValue({ WEBSITE_DOMAIN: 'http://localhost', NODE_ENV: 'test' })
}))

const mockCommunityService = {
  getByUserId: jest.fn(),
  create: jest.fn(),
  validateInvitation: jest.fn(),
  markInvitationAsUsed: jest.fn()
}

const mockPrismaService = {
  user: {
    create: jest.fn()
  }
}

const mockAuthAdapter = {
  getUserRoles: jest.fn(),
  getUserById: jest.fn(),
  signUp: jest.fn(),
  addRoleToUser: jest.fn(),
  getUsersByRole: jest.fn()
}

const mockEmailService = {
  sendPasswordResetEmail: jest.fn()
}

const mockLoggerService = {
  log: jest.fn(),
  error: jest.fn()
}

describe('AuthService', () => {
  let service: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: CommunityService, useValue: mockCommunityService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: 'IAuthAdapter', useValue: mockAuthAdapter },
        { provide: EmailService, useValue: mockEmailService },
        { provide: LoggerService, useValue: mockLoggerService }
      ]
    }).compile()

    service = module.get<AuthService>(AuthService)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('signInWithSession', () => {
    it('should sign in successfully', async () => {
      const req = { res: {} } as unknown as Request
      const signInDto = { email: 'test@example.com', password: 'password' }

      ;(EmailPassword.signIn as jest.Mock).mockResolvedValue({
        status: 'OK',
        user: { id: 'user-123', emails: ['test@example.com'] }
      })
      mockAuthAdapter.getUserRoles.mockResolvedValue([UserRole.USER])

      const result = await service.signInWithSession(signInDto, req)

      expect(result.status).toBe('OK')
      expect(result.user.id).toBe('user-123')
      expect(SessionRecipe.createNewSession).toHaveBeenCalled()
    })

    it('should throw ConflictException on wrong credentials', async () => {
      const req = { res: {} } as unknown as Request
      const signInDto = { email: 'test@example.com', password: 'wrong' }

      ;(EmailPassword.signIn as jest.Mock).mockResolvedValue({
        status: 'WRONG_CREDENTIALS_ERROR'
      })

      await expect(service.signInWithSession(signInDto, req)).rejects.toThrow(ConflictException)
    })

    it('should throw ConflictException on other login error', async () => {
      const req = { res: {} } as unknown as Request
      const signInDto = { email: 'test@example.com', password: 'password' }

      ;(EmailPassword.signIn as jest.Mock).mockResolvedValue({

      })

      await expect(service.signInWithSession(signInDto, req)).rejects.toThrow(ConflictException)
    })

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const req = { res: {} } as unknown as Request
      const signInDto = { email: 'test@example.com', password: 'password' }

      ;(EmailPassword.signIn as jest.Mock).mockRejectedValue(new Error('Unexpected'))

      await expect(service.signInWithSession(signInDto, req)).rejects.toThrow(InternalServerErrorException)
    })
  })

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      const session = { revokeSession: jest.fn().mockResolvedValue(undefined) } as any
      const result = await service.signOut(session)
      expect(result.status).toBe('OK')
    })

    it('should throw InternalServerErrorException on error', async () => {
      const session = { revokeSession: jest.fn().mockRejectedValue(new Error('Error')) } as any
      await expect(service.signOut(session)).rejects.toThrow(InternalServerErrorException)
    })
  })

  describe('sendPasswordResetToken', () => {
    it('should send reset token if user exists', async () => {
      ;(listUsersByAccountInfo as jest.Mock).mockResolvedValue([{ id: 'user-123' }])
      ;(EmailPassword.createResetPasswordToken as jest.Mock).mockResolvedValue({ status: 'OK', token: 'token' })

      const result = await service.sendPasswordResetToken({ email: 'test@example.com' })

      expect(result.status).toBe('OK')
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalled()
    })

    it('should return OK even if user does not exist', async () => {
      ;(listUsersByAccountInfo as jest.Mock).mockResolvedValue([])

      const result = await service.sendPasswordResetToken({ email: 'test@example.com' })

      expect(result.status).toBe('OK')
      expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled()
    })

    it('should log link in development mode', async () => {
      const { env } = require('@configs/env')
      env.mockReturnValue({ WEBSITE_DOMAIN: 'http://localhost', NODE_ENV: 'development' })

      ;(listUsersByAccountInfo as jest.Mock).mockResolvedValue([{ id: 'user-123' }])
      ;(EmailPassword.createResetPasswordToken as jest.Mock).mockResolvedValue({ status: 'OK', token: 'token' })

      await service.sendPasswordResetToken({ email: 'test@example.com' })

      expect(mockLoggerService.log).toHaveBeenCalledWith(expect.stringContaining('[Password Reset] Link gerado'))

      // Reset env
      env.mockReturnValue({ WEBSITE_DOMAIN: 'http://localhost', NODE_ENV: 'test' })
    })

    it('should throw InternalServerErrorException on error', async () => {
      ;(listUsersByAccountInfo as jest.Mock).mockRejectedValue(new Error('Error'))
      await expect(service.sendPasswordResetToken({ email: 'test@example.com' })).rejects.toThrow(InternalServerErrorException)
    })

    it('should throw InternalServerErrorException if token generation fails', async () => {
      ;(listUsersByAccountInfo as jest.Mock).mockResolvedValue([{ id: 'user-123' }])
      ;(EmailPassword.createResetPasswordToken as jest.Mock).mockResolvedValue({ status: 'UNKNOWN_ERROR' })
      const dto = { email: 'test@example.com' }

      await expect(service.sendPasswordResetToken(dto)).rejects.toThrow(InternalServerErrorException)
    })
  })

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      ;(EmailPassword.resetPasswordUsingToken as jest.Mock).mockResolvedValue({ status: 'OK' })

      const result = await service.resetPassword({ token: 'token', password: 'new-password' })

      expect(result.status).toBe('OK')
    })

    it('should throw ConflictException on invalid token', async () => {
      ;(EmailPassword.resetPasswordUsingToken as jest.Mock).mockResolvedValue({
        status: 'RESET_PASSWORD_INVALID_TOKEN_ERROR'
      })

      await expect(service.resetPassword({ token: 'invalid', password: 'new' })).rejects.toThrow(ConflictException)
    })

    it('should throw InternalServerErrorException on other error', async () => {
      ;(EmailPassword.resetPasswordUsingToken as jest.Mock).mockResolvedValue({
        status: 'UNKNOWN_ERROR'
      })

      await expect(service.resetPassword({ token: 'token', password: 'new' })).rejects.toThrow(InternalServerErrorException)
    })

    it('should throw InternalServerErrorException on exception', async () => {
      ;(EmailPassword.resetPasswordUsingToken as jest.Mock).mockRejectedValue(new Error('Error'))
      await expect(service.resetPassword({ token: 'token', password: 'new' })).rejects.toThrow(InternalServerErrorException)
    })
  })

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const session = { getUserId: jest.fn().mockReturnValue('user-123') } as any
      mockAuthAdapter.getUserById.mockResolvedValue({ id: 'user-123', email: 'test@example.com', roles: [UserRole.USER] })

      const result = await service.getCurrentUser(session)

      expect(result.status).toBe('OK')
      expect(result.user.id).toBe('user-123')
    })

    it('should throw InternalServerErrorException if user not found', async () => {
      const session = { getUserId: jest.fn().mockReturnValue('user-123') } as any
      mockAuthAdapter.getUserById.mockResolvedValue(null)

      await expect(service.getCurrentUser(session)).rejects.toThrow(InternalServerErrorException)
    })

    it('should return community info if user has community role', async () => {
      const session = { getUserId: jest.fn().mockReturnValue('user-123') } as any
      mockAuthAdapter.getUserById.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        roles: [UserRole.COMMUNITY]
      })
      mockCommunityService.getByUserId.mockResolvedValue({ id: 1 })

      const result = await service.getCurrentUser(session)
      expect(result.user.communityId).toBe(1)
    })

    it('should throw InternalServerErrorException on error', async () => {
      const session = { getUserId: jest.fn().mockReturnValue('user-123') } as any
      mockAuthAdapter.getUserById.mockRejectedValue(new Error('Error'))

      await expect(service.getCurrentUser(session)).rejects.toThrow(InternalServerErrorException)
    })
  })

  describe('createCommunity', () => {
    it('should create community successfully', async () => {
      const req = { res: {} } as unknown as Request
      const res = {} as Response
      const dto = { email: 'test@example.com', password: 'password', name: 'Community' } as any

      mockAuthAdapter.signUp.mockResolvedValue({ status: 'OK', user: { id: 'user-123' } })
      mockCommunityService.create.mockResolvedValue({ id: 1 })

      const result = await service.createCommunity(dto, req, res)

      expect(result.status).toBe('OK')
      expect(mockAuthAdapter.addRoleToUser).toHaveBeenCalledWith('user-123', UserRole.COMMUNITY)
      expect(SessionRecipe.createNewSession).toHaveBeenCalled()
      expect(mockPrismaService.user.create).toHaveBeenCalled()
    })

    it('should throw ConflictException if email already exists', async () => {
      const req = { res: {} } as unknown as Request
      const res = {} as Response
      const dto = { email: 'test@example.com', password: 'password', name: 'Community' } as any

      mockAuthAdapter.signUp.mockResolvedValue({ status: 'EMAIL_ALREADY_EXISTS_ERROR' })

      await expect(service.createCommunity(dto, req, res)).rejects.toThrow(ConflictException)
    })

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const req = { res: {} } as unknown as Request
      const res = {} as Response
      const dto = { email: 'test@example.com', password: 'password', name: 'Community' } as any

      mockAuthAdapter.signUp.mockRejectedValue(new Error('Unexpected'))

      await expect(service.createCommunity(dto, req, res)).rejects.toThrow(InternalServerErrorException)
    })
  })

  describe('createCommunityWithSession', () => {
    it('should create community with session successfully', async () => {
      const req = { res: {} } as unknown as Request
      const dto = { email: 'test@example.com', password: 'password', name: 'Community' } as any

      ;(EmailPassword.signUp as jest.Mock).mockResolvedValue({ status: 'OK', user: { id: 'user-123' } })
      mockCommunityService.create.mockResolvedValue({ id: 1 })

      const result = await service.createCommunityWithSession(dto, req)

      expect(result.status).toBe('OK')
      expect(mockAuthAdapter.addRoleToUser).toHaveBeenCalledWith('user-123', UserRole.COMMUNITY)
      expect(mockPrismaService.user.create).toHaveBeenCalled()
    })

    it('should throw ConflictException if email already exists', async () => {
      const req = { res: {} } as unknown as Request
      const dto = { email: 'test@example.com', password: 'password', name: 'Community' } as any
      ;(EmailPassword.signUp as jest.Mock).mockResolvedValue({ status: 'EMAIL_ALREADY_EXISTS' })

      await expect(service.createCommunityWithSession(dto, req)).rejects.toThrow(ConflictException)
    })

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const req = { res: {} } as unknown as Request
      const dto = { email: 'test@example.com', password: 'password', name: 'Community' } as any
      ;(EmailPassword.signUp as jest.Mock).mockRejectedValue(new Error('Unexpected'))

      await expect(service.createCommunityWithSession(dto, req)).rejects.toThrow(InternalServerErrorException)
    })
  })

  describe('createCommunityWithoutSession', () => {
    it('should create community without session successfully', async () => {
      const dto = { email: 'test@example.com', password: 'password', name: 'Community' } as any

      mockAuthAdapter.signUp.mockResolvedValue({ status: 'OK', user: { id: 'user-123' } })
      mockCommunityService.create.mockResolvedValue({ id: 1 })

      const result = await service.createCommunityWithoutSession(dto)

      expect(result.status).toBe('OK')
      expect(mockAuthAdapter.addRoleToUser).toHaveBeenCalledWith('user-123', UserRole.COMMUNITY)
    })

    it('should throw ConflictException if email already exists', async () => {
      const dto = { email: 'test@example.com', password: 'password', name: 'Community' } as any
      mockAuthAdapter.signUp.mockResolvedValue({ status: 'EMAIL_ALREADY_EXISTS' })

      await expect(service.createCommunityWithoutSession(dto)).rejects.toThrow(ConflictException)
    })

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const dto = { email: 'test@example.com', password: 'password', name: 'Community' } as any
      mockAuthAdapter.signUp.mockRejectedValue(new Error('Unexpected'))

      await expect(service.createCommunityWithoutSession(dto)).rejects.toThrow(InternalServerErrorException)
    })
  })

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const dto = { email: 'test@example.com', password: 'password', role: UserRole.USER, is_active: true }
      const session = { getUserId: jest.fn().mockReturnValue('admin-id') }

      mockAuthAdapter.getUserRoles.mockResolvedValue([UserRole.ADMIN])
      mockAuthAdapter.signUp.mockResolvedValue({ status: 'OK', user: { id: 'user-123' } })

      const result = await service.createUser(dto as any, session as any)

      expect(result.status).toBe('OK')
      expect(mockAuthAdapter.addRoleToUser).toHaveBeenCalledWith('user-123', UserRole.USER)
    })

    it('should throw ConflictException if non-admin tries to create user', async () => {
      const dto = { email: 'test@example.com', password: 'password', role: UserRole.USER, is_active: true }
      const session = { getUserId: jest.fn().mockReturnValue('user-id') }

      mockAuthAdapter.getUserRoles.mockResolvedValue([UserRole.USER])

      await expect(service.createUser(dto as any, session as any)).rejects.toThrow(ConflictException)
    })

    it('should throw ConflictException if email already exists', async () => {
      const dto = { email: 'test@example.com', password: 'password', role: UserRole.USER, is_active: true }
      const session = { getUserId: jest.fn().mockReturnValue('admin-id') }

      mockAuthAdapter.getUserRoles.mockResolvedValue([UserRole.ADMIN])
      mockAuthAdapter.signUp.mockResolvedValue({ status: 'EMAIL_ALREADY_EXISTS' })

      await expect(service.createUser(dto as any, session as any)).rejects.toThrow(ConflictException)
    })

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const dto = { email: 'test@example.com', password: 'password', role: UserRole.USER, is_active: true }
      const session = { getUserId: jest.fn().mockReturnValue('admin-id') }

      mockAuthAdapter.getUserRoles.mockResolvedValue([UserRole.ADMIN])
      mockAuthAdapter.signUp.mockRejectedValue(new Error('Unexpected'))

      await expect(service.createUser(dto as any, session as any)).rejects.toThrow(InternalServerErrorException)
    })
  })

  describe('bootstrapAdmin', () => {
    it('should create admin successfully', async () => {
      mockAuthAdapter.getUsersByRole.mockResolvedValue([])
      mockAuthAdapter.signUp.mockResolvedValue({ status: 'OK', user: { id: 'user-123' } })
      const dto = { email: 'admin@example.com', password: 'password' } as any

      const result = await service.bootstrapAdmin(dto)

      expect(result.status).toBe('OK')
      expect(mockAuthAdapter.addRoleToUser).toHaveBeenCalledWith('user-123', UserRole.ADMIN)
    })

    it('should throw ConflictException if admin already exists', async () => {
      mockAuthAdapter.getUsersByRole.mockResolvedValue([{ id: 'user-123' }])
      const dto = { email: 'admin@example.com', password: 'password' } as any

      await expect(service.bootstrapAdmin(dto)).rejects.toThrow(ConflictException)
    })

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const dto = { email: 'admin@example.com', password: 'password' } as any
      mockAuthAdapter.getUsersByRole.mockResolvedValue([])
      mockAuthAdapter.signUp.mockRejectedValue(new Error('Unexpected'))

      await expect(service.bootstrapAdmin(dto)).rejects.toThrow(InternalServerErrorException)
    })
  })

  describe('acceptInvite', () => {
    it('should accept invite successfully', async () => {
      const dto = { token: 'valid-token', password: 'password' }
      const invitation = { id: 'invitation-id', email: 'test@example.com', name: 'Community', description: 'Desc' }

      mockCommunityService.validateInvitation.mockResolvedValue(invitation)
      ;(EmailPassword.signUp as jest.Mock).mockResolvedValue({ status: 'OK', user: { id: 'user-123' } })
      mockPrismaService.user.create.mockResolvedValue({ id: 'user-123' })
      mockCommunityService.create.mockResolvedValue({})
      mockCommunityService.markInvitationAsUsed.mockResolvedValue({})

      const result = await service.acceptInvite(dto)

      expect(result).toEqual({ message: 'Convite aceito com sucesso', userId: 'user-123' })
      expect(mockCommunityService.validateInvitation).toHaveBeenCalledWith('valid-token')
      expect(EmailPassword.signUp).toHaveBeenCalledWith('public', 'test@example.com', 'password')
      expect(mockPrismaService.user.create).toHaveBeenCalled()
      expect(mockAuthAdapter.addRoleToUser).toHaveBeenCalledWith('user-123', UserRole.COMMUNITY)
      expect(mockCommunityService.create).toHaveBeenCalled()
      expect(mockCommunityService.markInvitationAsUsed).toHaveBeenCalledWith('invitation-id')
    })

    it('should throw ConflictException if email already exists', async () => {
      const dto = { token: 'valid-token', password: 'password' }
      const invitation = { id: 'invitation-id', email: 'test@example.com', name: 'Community' }

      mockCommunityService.validateInvitation.mockResolvedValue(invitation)
      ;(EmailPassword.signUp as jest.Mock).mockResolvedValue({ status: 'EMAIL_ALREADY_EXISTS_ERROR' })

      await expect(service.acceptInvite(dto)).rejects.toThrow(ConflictException)
    })
  })
})
