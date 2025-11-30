/* eslint-disable ts/unbound-method */
import { RateLimitMiddleware } from '@common/middleware/rate-limit.middleware'
import { RateLimiterService } from '@common/rate-limiter/rate-limiter.service'
import { env } from '@configs/env'
import { HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { Request, Response } from 'express'

// Mock env
jest.mock('@configs/env', () => ({
  env: jest.fn().mockReturnValue({ RATE_LIMIT_ENABLED: true })
}))

const mockRateLimiterService = {
  resolveIdentity: jest.fn().mockImplementation((req, extractor) => extractor(req)),
  getGlobalPolicy: jest.fn(),
  enforcePolicyCheckSlidingWindow: jest.fn()
}

describe('RateLimitMiddleware', () => {
  let middleware: RateLimitMiddleware

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitMiddleware,
        { provide: RateLimiterService, useValue: mockRateLimiterService }
      ]
    }).compile()

    middleware = module.get<RateLimitMiddleware>(RateLimitMiddleware)
    jest.clearAllMocks()
    ;(env as jest.Mock).mockReturnValue({ RATE_LIMIT_ENABLED: true })
  })

  it('should be defined', () => {
    expect(middleware).toBeDefined()
  })

  it('should skip rate limiting if disabled', async () => {
    ;(env as jest.Mock).mockReturnValue({ RATE_LIMIT_ENABLED: false })
    const req = {} as Request
    const res = {} as Response
    const next = jest.fn()

    await middleware.use(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(mockRateLimiterService.resolveIdentity).not.toHaveBeenCalled()
  })

  it('should call next if rate limit is not exceeded', async () => {
    const req = { ip: '127.0.0.1' } as Request
    const res = {} as Response
    const next = jest.fn()

    mockRateLimiterService.getGlobalPolicy.mockReturnValue({})
    mockRateLimiterService.enforcePolicyCheckSlidingWindow.mockResolvedValue(undefined)

    await middleware.use(req, res, next)

    expect(mockRateLimiterService.resolveIdentity).toHaveBeenCalled()
    expect(mockRateLimiterService.getGlobalPolicy).toHaveBeenCalled()
    expect(mockRateLimiterService.enforcePolicyCheckSlidingWindow).toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('should return 429 if rate limit is exceeded', async () => {
    const req = { ip: '127.0.0.1' } as Request
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response
    const next = jest.fn()

    mockRateLimiterService.getGlobalPolicy.mockReturnValue({})
    mockRateLimiterService.enforcePolicyCheckSlidingWindow.mockRejectedValue(new Error('Rate limit exceeded'))

    await middleware.use(req, res, next)

    expect(res.status as unknown as jest.Mock).toHaveBeenCalledWith(HttpStatus.TOO_MANY_REQUESTS)
    expect(res.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message: 'Rate limit exceeded',
      error: 'Too Many Requests'
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('should return 429 with default message if error has no message', async () => {
    const req = { ip: '127.0.0.1' } as Request
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response
    const next = jest.fn()

    mockRateLimiterService.getGlobalPolicy.mockReturnValue({})
    mockRateLimiterService.enforcePolicyCheckSlidingWindow.mockRejectedValue({})

    await middleware.use(req, res, next)

    expect(res.status as unknown as jest.Mock).toHaveBeenCalledWith(HttpStatus.TOO_MANY_REQUESTS)
    expect(res.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message: 'Muitas requisições. Por favor, aguarde antes de tentar novamente.',
      error: 'Too Many Requests'
    })
  })

  it('should use "unknown" if ip is missing', async () => {
    const req = {} as Request
    const res = {} as Response
    const next = jest.fn()

    mockRateLimiterService.getGlobalPolicy.mockReturnValue({})
    mockRateLimiterService.enforcePolicyCheckSlidingWindow.mockResolvedValue(undefined)

    await middleware.use(req, res, next)

    expect(mockRateLimiterService.resolveIdentity).toHaveReturnedWith('unknown')
  })
})
