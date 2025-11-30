import { validate } from '@configs/env'

describe('Env Config', () => {
  it('should validate correct config', () => {
    const config = {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://localhost:5439/db',
      REDIS_HOST: 'localhost',
      REDIS_PORT: 6379,
      REDIS_RATE_LIMIT_DB: 1,
      SUPERTOKENS_CONNECTION_URI: 'http://localhost:3567',
      SUPERTOKENS_APP_NAME: 'TestApp',
      WEBSITE_DOMAIN: 'http://localhost:3000',
      LOG_LEVEL: 'info',
      RATE_LIMIT_ENABLED: 'true',
      NODE_PORT: 3000
    }

    const result = validate(config)
    expect(result).toBeDefined()
    expect(result.NODE_ENV).toBe('test')
  })

  it('should throw error on invalid config', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    const config = {
      // Missing DATABASE_URL
      NODE_ENV: 'test'
    }

    expect(() => validate(config)).toThrow('Invalid environment variables')
    consoleErrorSpy.mockRestore()
  })
})
