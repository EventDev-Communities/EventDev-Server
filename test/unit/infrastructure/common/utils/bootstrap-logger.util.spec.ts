import { printBootstrapBanner } from '@common/utils/bootstrap-logger.util'
import { env } from '@configs/env'

jest.mock('@configs/env')

describe('printBootstrapBanner', () => {
  let stdoutWriteSpy: jest.SpyInstance

  beforeEach(() => {
    stdoutWriteSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
    ;(env as jest.Mock).mockReturnValue({
      NODE_PORT: 3000,
      NODE_ENV: 'test'
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should print success banner', () => {
    printBootstrapBanner(true)
    expect(stdoutWriteSpy).toHaveBeenCalledWith(expect.stringContaining('BOOTSTRAP COMPLETED SUCCESSFULLY'))
    expect(stdoutWriteSpy).toHaveBeenCalledWith(expect.stringContaining('Environment: test'))
    expect(stdoutWriteSpy).toHaveBeenCalledWith(expect.stringContaining('Port: 3000'))
  })

  it('should print failure banner', () => {
    printBootstrapBanner(false)
    expect(stdoutWriteSpy).toHaveBeenCalledWith(expect.stringContaining('BOOTSTRAP FAILED'))
  })
})
