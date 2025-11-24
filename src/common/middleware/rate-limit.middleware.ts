/**
 * MIDDLEWARE DE RATE LIMITING GLOBAL
 *
 * Aplica controle de taxa de requisições em todas as rotas da aplicação.
 * Protege contra:
 * - Ataques DDoS (Distributed Denial of Service)
 * - Abuso de API
 * - Brute force attacks
 * - Consumo excessivo de recursos
 *
 * Como funciona:
 * 1. Intercepta toda requisição HTTP
 * 2. Identifica o usuário (nesse caso, por IP)
 * 3. Verifica se excedeu o limite de requisições
 * 4. Se OK: permite passagem
 * 5. Se excedeu: retorna 429 Too Many Requests
 */

import { RateLimiterService } from '@common/rate-limiter/rate-limiter.service'
import { HttpStatus, Inject, Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response } from 'express'

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(
    @Inject(RateLimiterService)
    private readonly rateLimiterService: RateLimiterService
  ) {}

  /**
   * Intercepta requisições e aplica rate limiting
   *
   * @param req - Requisição HTTP do Express
   * @param res - Resposta HTTP do Express
   * @param next - Função para passar para próximo middleware
   */
  async use(req: Request, res: Response, next: (error?: Error) => void): Promise<void> {
    try {
      // Skip rate limiting in test environment if disabled
      if (process.env.RATE_LIMIT_ENABLED === 'false') {
        return next()
      }

      // Passo 1: Identificar usuário/cliente (usa IP como padrão)
      const identity = this.rateLimiterService.resolveIdentity(
        req,
        (request) => request.ip || 'unknown'
      )

      // Passo 2: Buscar política global de rate limiting
      const policy = this.rateLimiterService.getGlobalPolicy()

      // Passo 3: Verificar se pode prosseguir (lança erro se bloqueado)
      await this.rateLimiterService.enforcePolicyCheckSlidingWindow(
        identity,
        policy,
        'global'
      )

      // Passo 4: Rate limit OK, prosseguir para próximo middleware/controller
      next()
    } catch (error: unknown) {
      // Rate limit excedido ou erro de validação
      const message = error instanceof Error && error.message
        ? error.message
        : 'Muitas requisições. Por favor, aguarde antes de tentar novamente.'

      // Retorna HTTP 429 Too Many Requests
      res.status(HttpStatus.TOO_MANY_REQUESTS).json({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message,
        error: 'Too Many Requests'
      })
    }
  }
}
