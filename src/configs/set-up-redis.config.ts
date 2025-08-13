import { Provider } from '@nestjs/common'
import Redis from 'ioredis'
export const RedisRateLimitProvider: Provider = {
  provide: 'REDIS_RATE_LIMIT',
  useFactory: () => new Redis({ host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT), db: 1 })
}
