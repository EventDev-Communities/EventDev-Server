// Mock dotenvx to prevent it from loading .env file
jest.mock('@dotenvx/dotenvx/config', () => ({}))

describe('Env Config Initialization', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should fallback to process.env if initial validation fails', async () => {
    // Clear env to force validation failure
    process.env = {}

    // Re-import module to trigger initialization logic
    const envModule = await import('@configs/env')

    // Since validation failed, env() should return the raw process.env (which is {})
    // casted as EnvConfig.
    expect(envModule.env()).toEqual({})
  })
})
