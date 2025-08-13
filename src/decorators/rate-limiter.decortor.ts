import { SetMetadata } from '@nestjs/common'
import { IRateLimiter } from 'src/interface/rate-limiter.interface'
export const RateLimit = (DataRateLimitingDecorator: IRateLimiter) => SetMetadata('rate-limit-data', DataRateLimitingDecorator)
