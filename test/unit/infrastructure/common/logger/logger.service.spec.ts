import { LoggerService } from '@common/logger/logger.service'
import { Test, TestingModule } from '@nestjs/testing'
import pino from 'pino'

jest.mock('pino', () => {
  const mLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn()
  }
  return jest.fn(() => mLogger)
})

jest.mock('@configs/env', () => ({
  env: jest.fn().mockReturnValue({ LOG_LEVEL: 'info', NODE_ENV: 'test' })
}))

describe('LoggerService', () => {
  let service: LoggerService
  let pinoLogger: any

  beforeEach(async () => {
    // Clear mocks to ensure pino constructor is called fresh
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService]
    }).compile()

    service = module.get<LoggerService>(LoggerService)
    // Get the logger instance returned by the mock
    pinoLogger = (pino as unknown as jest.Mock).mock.results[0].value
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should log info', () => {
    service.log('test message')
    expect(pinoLogger.info).toHaveBeenCalledWith(expect.objectContaining({ context: undefined }), 'test message')
  })

  it('should log error', () => {
    service.error('test error', 'trace')
    expect(pinoLogger.error).toHaveBeenCalledWith(expect.objectContaining({ context: undefined, trace: 'trace' }), 'test error')
  })

  it('should log warn', () => {
    service.warn('test warn')
    expect(pinoLogger.warn).toHaveBeenCalledWith(expect.objectContaining({ context: undefined }), 'test warn')
  })

  it('should log debug', () => {
    service.debug('test debug')
    expect(pinoLogger.debug).toHaveBeenCalledWith(expect.objectContaining({ context: undefined }), 'test debug')
  })

  it('should log verbose', () => {
    service.verbose('test verbose')
    expect(pinoLogger.trace).toHaveBeenCalledWith(expect.objectContaining({ context: undefined }), 'test verbose')
  })

  it('should set context', () => {
    service.setContext('TestContext')
    service.log('test message')
    expect(pinoLogger.info).toHaveBeenCalledWith(expect.objectContaining({ context: 'TestContext' }), 'test message')
  })

  describe('formatParams', () => {
    it('should handle single object param', () => {
      service.log('test', { key: 'value' })
      expect(pinoLogger.info).toHaveBeenCalledWith(expect.objectContaining({ key: 'value' }), 'test')
    })

    it('should handle multiple params', () => {
      service.log('test', 'param1', 'param2')
      expect(pinoLogger.info).toHaveBeenCalledWith(expect.objectContaining({ data: ['param1', 'param2'] }), 'test')
    })
  })
})
