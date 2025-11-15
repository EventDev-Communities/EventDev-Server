/**
 * DECORATOR DE RATE LIMITING CUSTOMIZADO
 *
 * Permite aplicar políticas de rate limiting específicas em controllers/rotas.
 *
 * Uso:
 *
 * @RateLimit({
 *   limit: 5,
 *   windowMs: 60000,
 *   domain: 'auth',
 *   banSeconds: 300
 * })
 * @Post('login')
 * async login() { ... }
 */

import { AvailableDomainsType } from '@common/rate-limiter/interfaces/rate-limit-key.interface'
import { SetMetadata } from '@nestjs/common'

/**
 * Chave para armazenar metadados de rate limiting
 */
export const RATE_LIMIT_KEY = 'rate-limit-config'

/**
 * Configuração de rate limit para o decorator
 */
export interface RateLimitDecoratorConfig {
  /** Máximo de requisições permitidas */
  limit: number
  /** Janela de tempo em milissegundos */
  windowMs: number
  /** Domínio da aplicação */
  domain: AvailableDomainsType
  /** Duração do ban em segundos (opcional) */
  banSeconds?: number
}

/**
 * Decorator para definir rate limit customizado em uma rota
 *
 * @param config - Configuração de rate limiting
 * @returns Decorator do NestJS
 */
export const RateLimit = (config: RateLimitDecoratorConfig) =>
  SetMetadata(RATE_LIMIT_KEY, config)
