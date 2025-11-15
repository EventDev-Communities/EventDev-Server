import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common'
import pino from 'pino'

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: pino.Logger
  private context?: string

  constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV === 'production'
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname'
            }
          }
    })
  }

  setContext(context: string) {
    this.context = context
  }

  log(message: string, ...optionalParams: unknown[]) {
    this.logger.info({ context: this.context, ...this.formatParams(optionalParams) }, message)
  }

  error(message: string, trace?: string, ...optionalParams: unknown[]) {
    this.logger.error({ context: this.context, trace, ...this.formatParams(optionalParams) }, message)
  }

  warn(message: string, ...optionalParams: unknown[]) {
    this.logger.warn({ context: this.context, ...this.formatParams(optionalParams) }, message)
  }

  debug(message: string, ...optionalParams: unknown[]) {
    this.logger.debug({ context: this.context, ...this.formatParams(optionalParams) }, message)
  }

  verbose(message: string, ...optionalParams: unknown[]) {
    this.logger.trace({ context: this.context, ...this.formatParams(optionalParams) }, message)
  }

  private formatParams(params: unknown[]): Record<string, unknown> {
    if (params.length === 0) {
      return {}
    }
    if (params.length === 1 && typeof params[0] === 'object') {
      return params[0] as Record<string, unknown>
    }
    return { data: params }
  }
}
