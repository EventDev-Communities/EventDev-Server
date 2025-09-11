import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response } from 'express'
import { RateLimiterService } from 'src/module/rateLimiter/rate-limiter.service'

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(private readonly rateLimitingService: RateLimiterService) {}

  async use(req: Request, res: Response, next: (error?: any) => void) {
    try {
      const id = this.rateLimitingService.resolveIdentity(req, (request) => `${request.ip}`)
      const policy = this.rateLimitingService.getGlobalPolicy()
      await this.rateLimitingService.enforcePolicyCheckSlidingWindow(id, policy, 'global')
      next()
    } catch (error: unknown) {
      const message = error instanceof Error && error.message ? error.message : 'Too Many Requests'
      res.status(429).json({ status: res.statusCode, message })
    }
  }
}
