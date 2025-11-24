import { RateLimiterService } from '@common/rate-limiter/rate-limiter.service'
import { Test, TestingModule } from '@nestjs/testing'
import Redis from 'ioredis'

describe('RateLimiterService', () => {
  let service: RateLimiterService
  let redisMock: jest.Mocked<Redis>
  let moduleRef: TestingModule

  beforeEach(async () => {
    redisMock = {
      eval: jest.fn(),
      evalsha: jest.fn(),
      script: jest.fn().mockReturnValue({
        load: jest.fn().mockResolvedValue('mock-sha')
      }),
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      sadd: jest.fn(),
      sismember: jest.fn(),
      srem: jest.fn(),
      exists: jest.fn(),
      ttl: jest.fn(),
      quit: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn(),
      status: 'ready'
    } as any

    moduleRef = await Test.createTestingModule({
      providers: [
        RateLimiterService,
        {
          provide: 'REDIS_RATE_LIMIT',
          useValue: redisMock
        }
      ]
    }).compile()

    service = moduleRef.get<RateLimiterService>(RateLimiterService)
  })

  afterEach(async () => {
    jest.clearAllMocks()
    await moduleRef.close()
  })

  describe('resolveIdentity', () => {
    it('should resolve identity using resolver function', () => {
      const request = { ip: '127.0.0.1' } as any
      const resolver = (req: any) => req.ip

      const identity = service.resolveIdentity(request, resolver)

      expect(identity).toBe('127.0.0.1')
    })

    it('should handle custom identity resolver', () => {
      const request = { user: { id: '123' } } as any
      const resolver = (req: any) => `user:${req.user.id}`

      const identity = service.resolveIdentity(request, resolver)

      expect(identity).toBe('user:123')
    })

    it('should throw error when resolver returns empty', () => {
      const request = {} as any
      const resolver = () => ''

      expect(() => service.resolveIdentity(request, resolver)).toThrow()
    })
  })

  describe('getGlobalPolicy', () => {
    it('should return global policy configuration', () => {
      const policy = service.getGlobalPolicy()

      expect(policy).toBeDefined()
      expect(policy).toHaveProperty('domain')
      expect(policy).toHaveProperty('windowMs')
      expect(policy).toHaveProperty('limit')
    })
  })

  describe('enforcePolicyCheckSlidingWindow', () => {
    it('should allow request when under limit', async () => {
      const identity = 'test-user'
      const policy = {
        domain: 'global' as const,
        windowMs: 60000,
        limit: 10,
        banSeconds: 300,
        failClosed: false
      }

      redisMock.exists.mockResolvedValue(0)
      redisMock.sismember.mockResolvedValue(0)
      redisMock.evalsha.mockResolvedValue([1, 10, 0])

      await expect(
        service.enforcePolicyCheckSlidingWindow(identity, policy, 'global')
      ).resolves.not.toThrow()
    })

    it('should throw error when rate limit exceeded', async () => {
      const identity = 'test-user'
      const policy = {
        domain: 'global' as const,
        windowMs: 60000,
        limit: 10,
        banSeconds: 300,
        failClosed: false
      }

      redisMock.exists.mockResolvedValue(0)
      redisMock.sismember.mockResolvedValue(0)
      redisMock.evalsha.mockResolvedValue([11, 10, 0])

      await expect(
        service.enforcePolicyCheckSlidingWindow(identity, policy, 'global')
      ).rejects.toThrow()
    })

    it('should throw error when user is banned', async () => {
      const identity = 'banned-user'
      const policy = {
        domain: 'global' as const,
        windowMs: 60000,
        limit: 10,
        banSeconds: 300,
        failClosed: false
      }

      redisMock.exists.mockResolvedValue(1)

      await expect(
        service.enforcePolicyCheckSlidingWindow(identity, policy, 'global')
      ).rejects.toThrow('Acesso bloqueado permanentemente')
    })

    it('should reject request and return TTL when limit exceeded', async () => {
      const identity = 'test-user'
      const policy = {
        domain: 'global' as const,
        windowMs: 60000,
        limit: 10,
        banSeconds: 300,
        failClosed: false
      }

      redisMock.exists.mockResolvedValue(0)
      redisMock.sismember.mockResolvedValue(0)
      redisMock.ttl.mockResolvedValue(-1)
      // [allowed, ttl] - allowed=0 means rate limit exceeded, TTL is seconds to wait
      redisMock.evalsha.mockResolvedValue([0, 45])

      await expect(
        service.enforcePolicyCheckSlidingWindow(identity, policy, 'global')
      ).rejects.toThrow(/Aguarde 45 segundos/)
    })
  })

  describe('error handling', () => {
    it('should handle Redis connection errors', async () => {
      const identity = 'test-user'
      const policy = {
        domain: 'global' as const,
        windowMs: 60000,
        maxRequests: 10,
        banDurationMs: 300000,
        banThreshold: 5,
        prefix: 'ratelimit',
        limit: 10,
        failClosed: true
      }

      redisMock.sismember.mockRejectedValue(new Error('Redis connection failed'))

      await expect(
        service.enforcePolicyCheckSlidingWindow(identity, policy, 'global')
      ).rejects.toThrow()
    })
  })
})
