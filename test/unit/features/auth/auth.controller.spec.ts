import { AuthController } from '@module/auth/auth.controller'
import { AuthService } from '@module/auth/auth.service'
import { Test, TestingModule } from '@nestjs/testing'

describe('AuthController', () => {
  let controller: AuthController

  const mockAuthService = {
    signInWithSession: jest.fn(),
    signOut: jest.fn(),
    sendPasswordResetToken: jest.fn(),
    resetPassword: jest.fn(),
    getCurrentUser: jest.fn(),
    createUser: jest.fn(),
    createCommunity: jest.fn(),
    createCommunityWithoutSession: jest.fn(),
    bootstrapAdmin: jest.fn(),
    createCommunityWithSession: jest.fn(),
    acceptInvite: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService
        }
      ]
    }).compile()

    controller = module.get<AuthController>(AuthController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('signIn', () => {
    it('should call authService.signInWithSession', async () => {
      const dto = { email: 'test@example.com', password: 'password' }
      const req = {} as any
      const res = {} as any
      await controller.signIn(dto, req, res)
      expect(mockAuthService.signInWithSession).toHaveBeenCalledWith(dto, req, res)
    })
  })

  describe('signOut', () => {
    it('should call authService.signOut', async () => {
      const session = {} as any
      await controller.signOut(session)
      expect(mockAuthService.signOut).toHaveBeenCalledWith(session)
    })
  })

  describe('forgotPassword', () => {
    it('should call authService.sendPasswordResetToken', async () => {
      const dto = { email: 'test@example.com' }
      await controller.forgotPassword(dto)
      expect(mockAuthService.sendPasswordResetToken).toHaveBeenCalledWith(dto)
    })
  })

  describe('resetPassword', () => {
    it('should call authService.resetPassword', async () => {
      const dto = { token: 'token', password: 'newPassword' }
      await controller.resetPassword(dto)
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(dto)
    })
  })

  describe('getCurrentUser', () => {
    it('should call authService.getCurrentUser', async () => {
      const session = {} as any
      await controller.getCurrentUser(session)
      expect(mockAuthService.getCurrentUser).toHaveBeenCalledWith(session)
    })
  })

  describe('createCommunity', () => {
    it('should call authService.createCommunityWithoutSession', async () => {
      const dto = { name: 'Community', email: 'test@comm.com', password: 'pass' } as any
      await controller.createCommunity(dto)
      expect(mockAuthService.createCommunityWithoutSession).toHaveBeenCalledWith(dto)
    })
  })

  describe('bootstrapAdmin', () => {
    it('should call authService.bootstrapAdmin', async () => {
      const dto = { name: 'Admin', email: 'admin@test.com', password: 'pass' } as any
      await controller.bootstrapAdmin(dto)
      expect(mockAuthService.bootstrapAdmin).toHaveBeenCalledWith(dto)
    })
  })

  describe('signUpCommunity', () => {
    it('should call authService.createCommunityWithSession', async () => {
      const dto = { name: 'Community', email: 'test@comm.com', password: 'pass' } as any
      const req = {} as any
      await controller.signUpCommunity(dto, req)
      expect(mockAuthService.createCommunityWithSession).toHaveBeenCalledWith(dto, req)
    })
  })

  describe('acceptInvite', () => {
    it('should call authService.acceptInvite', async () => {
      const dto = { token: 'token', name: 'User', password: 'pass' } as any
      await controller.acceptInvite(dto)
      expect(mockAuthService.acceptInvite).toHaveBeenCalledWith(dto)
    })
  })
})
