import { env } from '@configs/env'

export function printBootstrapBanner(isSuccess: boolean): void {
  const reset = '\x1B[0m'
  const green = '\x1B[32m'
  const yellow = '\x1B[33m'
  const red = '\x1B[31m'
  const port = env().NODE_PORT

  const statusColor = isSuccess ? green : red
  const statusMessage = isSuccess ? 'BOOTSTRAP COMPLETED SUCCESSFULLY' : 'BOOTSTRAP FAILED'

  const envText = `Environment: ${env().NODE_ENV}`
  const portText = `Port: ${port}`
  const maxLength = Math.max(statusMessage.length, envText.length, portText.length)
  const separator = '='.repeat(maxLength + 4)

  process.stdout.write(
    [
      '',
      `${statusColor}${separator}${reset}`,
      `${statusColor}  ${statusMessage}${reset}`,
      `${yellow}  ${envText}${reset}`,
      `${yellow}  ${portText}${reset}`,
      `${statusColor}${separator}${reset}`,
      ''
    ].join('\n')
  )
}
