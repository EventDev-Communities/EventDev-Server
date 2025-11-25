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
    createCommunity: jest.fn()
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
      await controller.signIn(dto, req)
      expect(mockAuthService.signInWithSession).toHaveBeenCalledWith(dto, req)
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
})
