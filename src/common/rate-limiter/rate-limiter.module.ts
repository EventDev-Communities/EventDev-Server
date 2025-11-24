/**
 * MÓDULO DE RATE LIMITING
 *
 * Módulo global que fornece serviços de controle de taxa de requisições
 * para toda a aplicação.
 *
 * Exporta:
 * - RateLimiterService: Serviço principal de rate limiting
 * - REDIS_RATE_LIMIT: Cliente Redis configurado
 *
 * Uso em outros módulos:
 * 1. Não precisa importar (módulo global)
 * 2. Injete RateLimiterService onde necessário
 * 3. Use middlewares ou guards para aplicar rate limits
 */

import { RateLimitMiddleware } from '@common/middleware/rate-limit.middleware'
import { RateLimiterService } from '@common/rate-limiter/rate-limiter.service'
import { RedisRateLimitProvider } from '@configs/redis.config'
import { Global, Module } from '@nestjs/common'

@Global()
@Module({
  providers: [
    RedisRateLimitProvider, // Cliente Redis
    RateLimiterService, // Serviço de rate limiting
    RateLimitMiddleware // Middleware global com DI resolvido
  ],
  exports: [
    'REDIS_RATE_LIMIT', // Exporta cliente Redis para uso direto se necessário
    RateLimiterService,
    RateLimitMiddleware // Permite aplicar middleware em outros módulos
  ]
})
export class RateLimiterModule {}
