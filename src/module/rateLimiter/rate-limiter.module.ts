import { Global, Module } from '@nestjs/common'
import { RedisRateLimitProvider } from 'src/configs/set-up-redis.config'
import { RateLimiterService } from './rate-limiter.service'
@Global()
@Module({
  providers: [RedisRateLimitProvider, RateLimiterService],
  exports: ['REDIS_RATE_LIMIT', RateLimiterService]
})
export class RateLimiterModule {}
