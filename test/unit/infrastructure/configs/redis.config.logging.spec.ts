import { RedisRateLimitProvider } from '@configs/redis.config'
import { Test } from '@nestjs/testing'
import Redis from 'ioredis'

// Mock env BEFORE import
jest.mock('@configs/env', () => ({
  env: jest.fn().mockReturnValue({
    NODE_ENV: 'development', // Force development to enable logging
    REDIS_HOST: 'localhost',
    REDIS_PORT: 6379,
    REDIS_RATE_LIMIT_DB: 1
  })
}))

// Mock ioredis
jest.mock('ioredis')

describe('Redis Config Logging', () => {
  let mockRedisInstance: any
  let RedisMock: any

  let consoleWarnSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(async () => {
    jest.clearAllMocks()

    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    mockRedisInstance = {
      on: jest.fn()
    }

    RedisMock = Redis
    ;(RedisMock as unknown as jest.Mock).mockReturnValue(mockRedisInstance)

    await Test.createTestingModule({
      providers: [RedisRateLimitProvider]
    }).compile()
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  it('should log events when NODE_ENV is not test', () => {
    // Verify creation log
    expect(consoleWarnSpy).toHaveBeenCalledWith('[RedisRateLimit] creating Redis client', expect.any(Object))

    // Trigger 'connect'
    const connectCallback = mockRedisInstance.on.mock.calls.find((call: any) => call[0] === 'connect')[1]
    connectCallback()
    expect(consoleWarnSpy).toHaveBeenCalledWith('[RedisRateLimit] connect event fired')

    // Trigger 'ready'
    const readyCallback = mockRedisInstance.on.mock.calls.find((call: any) => call[0] === 'ready')[1]
    readyCallback()
    expect(consoleWarnSpy).toHaveBeenCalledWith('[RedisRateLimit] ready event fired')

    // Trigger 'error'
    const errorCallback = mockRedisInstance.on.mock.calls.find((call: any) => call[0] === 'error')[1]
    errorCallback(new Error('Test Error'))
    expect(consoleErrorSpy).toHaveBeenCalledWith('[RedisRateLimit] error event', 'Test Error')

    // Trigger 'end'
    const endCallback = mockRedisInstance.on.mock.calls.find((call: any) => call[0] === 'end')[1]
    endCallback()
    expect(consoleWarnSpy).toHaveBeenCalledWith('[RedisRateLimit] connection ended')
  })
})
