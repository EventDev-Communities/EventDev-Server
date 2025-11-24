import { RateLimitGuard } from '@common/guards/rate-limit.guard'
import { RateLimiterService } from '@common/rate-limiter/rate-limiter.service'
import { ExecutionContext, HttpStatus } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'

describe('RateLimitGuard', () => {
  let guard: RateLimitGuard
  let reflector: Reflector
  let rateLimiterService: jest.Mocked<RateLimiterService>
  let moduleRef: TestingModule

  beforeEach(async () => {
    const mockRateLimiterService = {
      resolveIdentity: jest.fn(),
      enforcePolicyCheckSlidingWindow: jest.fn()
    }

    moduleRef = await Test.createTestingModule({
      providers: [
        RateLimitGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn()
          }
        },
        {
          provide: RateLimiterService,
          useValue: mockRateLimiterService
        }
      ]
    }).compile()

    guard = moduleRef.get<RateLimitGuard>(RateLimitGuard)
    reflector = moduleRef.get<Reflector>(Reflector)
    rateLimiterService = moduleRef.get<RateLimiterService>(RateLimiterService) as jest.Mocked<RateLimiterService>
  })

  afterEach(async () => {
    jest.clearAllMocks()
    await moduleRef.close()
  })

  describe('canActivate', () => {
    let mockContext: ExecutionContext
    let mockRequest: any
    let mockResponse: any
    let mockHttpContext: any

    beforeEach(() => {
      mockRequest = {
        ip: '127.0.0.1',
        user: null
      }

      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      }

      mockHttpContext = {
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse)
      }

      mockContext = {
        switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
        getHandler: jest.fn(),
        getClass: jest.fn()
      } as any
    })

    it('should allow request when no custom policy is defined', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null)

      const result = await guard.canActivate(mockContext)

      expect(result).toBe(true)
      const callCount = rateLimiterService.enforcePolicyCheckSlidingWindow.mock.calls.length
      expect(callCount).toBe(0)
    })

    it('should allow request when under rate limit', async () => {
      const customPolicy = {
        domain: 'auth' as const,
        windowMs: 60000,
        limit: 5,
        banSeconds: 300
      }

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(customPolicy)
      rateLimiterService.resolveIdentity.mockReturnValue('127.0.0.1')
      rateLimiterService.enforcePolicyCheckSlidingWindow.mockResolvedValue(undefined)

      const result = await guard.canActivate(mockContext)

      expect(result).toBe(true)
      const identityCallCount = rateLimiterService.resolveIdentity.mock.calls.length
      expect(identityCallCount).toBe(1)

      const enforceCalls = rateLimiterService.enforcePolicyCheckSlidingWindow.mock.calls
      expect(enforceCalls.length).toBe(1)
      expect(enforceCalls[0][0]).toBe('127.0.0.1')
      expect(enforceCalls[0][2]).toBe('auth')
    })

    it('should block request when rate limit exceeded', async () => {
      const customPolicy = {
        domain: 'auth' as const,
        windowMs: 60000,
        limit: 5,
        banSeconds: 300
      }

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(customPolicy)
      rateLimiterService.resolveIdentity.mockReturnValue('127.0.0.1')
      rateLimiterService.enforcePolicyCheckSlidingWindow.mockRejectedValue(
        new Error('Rate limit exceeded')
      )

      const result = await guard.canActivate(mockContext)

      expect(result).toBe(false)
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.TOO_MANY_REQUESTS)
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Rate limit exceeded',
        error: 'Too Many Requests'
      })
    })

    it('should use user ID when user is authenticated', async () => {
      mockRequest.user = { id: 'user-123' }

      const customPolicy = {
        domain: 'users' as const,
        windowMs: 60000,
        limit: 100,
        banSeconds: 300
      }

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(customPolicy)
      rateLimiterService.resolveIdentity.mockReturnValue('user:user-123')
      rateLimiterService.enforcePolicyCheckSlidingWindow.mockResolvedValue(undefined)

      const result = await guard.canActivate(mockContext)

      expect(result).toBe(true)
      const identityCallCount = rateLimiterService.resolveIdentity.mock.calls.length
      expect(identityCallCount).toBe(1)
    })

    it('should handle errors gracefully', async () => {
      const customPolicy = {
        domain: 'global' as const,
        windowMs: 60000,
        limit: 10,
        banSeconds: 300
      }

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(customPolicy)
      rateLimiterService.resolveIdentity.mockReturnValue('127.0.0.1')
      rateLimiterService.enforcePolicyCheckSlidingWindow.mockRejectedValue(
        new Error('Unexpected error')
      )

      const result = await guard.canActivate(mockContext)

      expect(result).toBe(false)
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.TOO_MANY_REQUESTS)
    })

    it('should use default message when error has no message', async () => {
      const customPolicy = {
        domain: 'global' as const,
        windowMs: 60000,
        limit: 10,
        banSeconds: 300
      }

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(customPolicy)
      rateLimiterService.resolveIdentity.mockReturnValue('127.0.0.1')
      rateLimiterService.enforcePolicyCheckSlidingWindow.mockRejectedValue('String error')

      const result = await guard.canActivate(mockContext)

      expect(result).toBe(false)
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Muitas requisições. Por favor, aguarde antes de tentar novamente.',
        error: 'Too Many Requests'
      })
    })
  })
})
