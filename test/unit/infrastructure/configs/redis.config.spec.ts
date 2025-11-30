import { Test, TestingModule } from '@nestjs/testing'

// Mutable env state for testing
const mockEnvState = {
  NODE_ENV: 'test',
  REDIS_HOST: 'localhost',
  REDIS_PORT: 6379,
  REDIS_RATE_LIMIT_DB: 1
}

jest.mock('ioredis')
jest.mock('@configs/env', () => ({
  env: jest.fn().mockImplementation(() => mockEnvState)
}))

describe('RedisRateLimitProvider', () => {
  let provider: any
  let mockRedisInstance: any
  let RedisRateLimitProvider: any
  let RedisMock: any

  beforeEach(async () => {
    jest.resetModules()
    mockEnvState.NODE_ENV = 'test'

    mockRedisInstance = {
      on: jest.fn()
    }

    // Configure the mock for the current module context
    RedisMock = (await import('ioredis')).default
    ;(RedisMock as unknown as jest.Mock).mockReturnValue(mockRedisInstance)

    // Re-import to pick up the env change if needed
    const redisConfigModule = await import('@configs/redis.config')
    RedisRateLimitProvider = redisConfigModule.RedisRateLimitProvider

    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisRateLimitProvider]
    }).compile()

    provider = module.get('REDIS_RATE_LIMIT')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })

  it('should create a Redis client with correct config', () => {
    expect(RedisMock).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'localhost',
        port: 6379,
        db: 1,
        retryStrategy: expect.any(Function),
        commandTimeout: 5000,
        enableOfflineQueue: true,
        reconnectOnError: expect.any(Function)
      })
    )
  })

  it('should have a retry strategy', () => {
    const config = RedisMock.mock.calls[0][0]
    const retryStrategy = config.retryStrategy

    expect(retryStrategy(1)).toBe(50)
    expect(retryStrategy(100)).toBe(3000)
  })

  it('should have a reconnectOnError strategy', () => {
    const config = RedisMock.mock.calls[0][0]
    const reconnectOnError = config.reconnectOnError

    expect(reconnectOnError(new Error('READONLY You can\'t write against a read only replica.'))).toBe(true)
    expect(reconnectOnError(new Error('Connection lost'))).toBe(false)
  })

  it('should register event listeners', () => {
    expect(mockRedisInstance.on).toHaveBeenCalledWith('connect', expect.any(Function))
    expect(mockRedisInstance.on).toHaveBeenCalledWith('ready', expect.any(Function))
    expect(mockRedisInstance.on).toHaveBeenCalledWith('error', expect.any(Function))
    expect(mockRedisInstance.on).toHaveBeenCalledWith('end', expect.any(Function))
  })

  it('should log error on error event', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const errorCallback = mockRedisInstance.on.mock.calls.find((call: any) => call[0] === 'error')[1]

    errorCallback(new Error('Test error'))

    expect(consoleSpy).toHaveBeenCalledWith('[RedisRateLimit] error event', 'Test error')
    consoleSpy.mockRestore()
  })
})

describe('RedisRateLimitProvider with Logging', () => {
  let RedisRateLimitProviderWithLogging: any
  let mockRedisInstance: any

  beforeEach(async () => {
    jest.resetModules()
    mockEnvState.NODE_ENV = 'development'

    mockRedisInstance = {
      on: jest.fn()
    }
    const RedisMock = (await import('ioredis')).default
    ;(RedisMock as unknown as jest.Mock).mockReturnValue(mockRedisInstance)

    // Re-import the module to trigger top-level code execution with new env
    const redisConfigModule = await import('@configs/redis.config')
    RedisRateLimitProviderWithLogging = redisConfigModule.RedisRateLimitProvider
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should log events when not in test environment', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

    // Invoke factory
    RedisRateLimitProviderWithLogging.useFactory()

    expect(consoleWarnSpy).toHaveBeenCalledWith('[RedisRateLimit] creating Redis client', expect.any(Object))

    // Trigger events
    const connectCallback = mockRedisInstance.on.mock.calls.find((call: any) => call[0] === 'connect')[1]
    connectCallback()
    expect(consoleWarnSpy).toHaveBeenCalledWith('[RedisRateLimit] connect event fired')

    const readyCallback = mockRedisInstance.on.mock.calls.find((call: any) => call[0] === 'ready')[1]
    readyCallback()
    expect(consoleWarnSpy).toHaveBeenCalledWith('[RedisRateLimit] ready event fired')

    const endCallback = mockRedisInstance.on.mock.calls.find((call: any) => call[0] === 'end')[1]
    endCallback()
    expect(consoleWarnSpy).toHaveBeenCalledWith('[RedisRateLimit] connection ended')

    consoleWarnSpy.mockRestore()
  })
})
