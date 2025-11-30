import { RateLimiterModule } from '@common/rate-limiter/rate-limiter.module'
import { RateLimiterService } from '@common/rate-limiter/rate-limiter.service'
import { Test, TestingModule } from '@nestjs/testing'

jest.mock('@configs/redis.config', () => ({
  RedisRateLimitProvider: {
    provide: 'REDIS_RATE_LIMIT',
    useValue: {
      on: jest.fn(),
      quit: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      incr: jest.fn(),
      expire: jest.fn()
    }
  }
}))

describe('RateLimiterModule', () => {
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [RateLimiterModule]
    }).compile()
  })

  it('should be defined', () => {
    expect(module).toBeDefined()
    expect(module.get(RateLimiterService)).toBeDefined()
  })
})
