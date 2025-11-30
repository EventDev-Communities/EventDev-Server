import { LoggerService } from '@common/logger/logger.service'
import { AuthContextMiddleware } from '@common/middleware/auth-context.middleware'
import { Test, TestingModule } from '@nestjs/testing'
import { Request, Response } from 'express'

const mockAuthAdapter = {
  getUserById: jest.fn()
}

const mockLoggerService = {
  debug: jest.fn()
}

describe('AuthContextMiddleware', () => {
  let middleware: AuthContextMiddleware

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthContextMiddleware,
        { provide: 'IAuthAdapter', useValue: mockAuthAdapter },
        { provide: LoggerService, useValue: mockLoggerService }
      ]
    }).compile()

    middleware = module.get<AuthContextMiddleware>(AuthContextMiddleware)
  })

  it('should be defined', () => {
    expect(middleware).toBeDefined()
  })

  it('should call next() if session is not present', async () => {
    const req = {} as Request
    const res = {} as Response
    const next = jest.fn()

    await middleware.use(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(mockAuthAdapter.getUserById).not.toHaveBeenCalled()
  })

  it('should enrich req.user if session exists and user is found', async () => {
    const req = {
      session: {
        getUserId: jest.fn().mockReturnValue('user-123')
      }
    } as unknown as Request
    const res = {} as Response
    const next = jest.fn()

    const mockUser = { id: 'user-123', email: 'test@example.com', communityId: 1 }
    mockAuthAdapter.getUserById.mockResolvedValue(mockUser)

    await middleware.use(req, res, next)

    expect(mockAuthAdapter.getUserById).toHaveBeenCalledWith('user-123')
    expect(req.user).toEqual({ ...mockUser, communityId: 1 })
    expect(next).toHaveBeenCalled()
  })

  it('should handle error when fetching user', async () => {
    const req = {
      session: {
        getUserId: jest.fn().mockReturnValue('user-123')
      }
    } as unknown as Request
    const res = {} as Response
    const next = jest.fn()

    mockAuthAdapter.getUserById.mockRejectedValue(new Error('Fetch error'))

    await middleware.use(req, res, next)

    expect(mockLoggerService.debug).toHaveBeenCalledWith('Error enriching user context', { error: 'Fetch error' })
    expect(next).toHaveBeenCalled()
  })
})
