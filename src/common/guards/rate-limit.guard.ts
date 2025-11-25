import { RATE_LIMIT_KEY, RateLimitDecoratorConfig } from '@common/decorators/rate-limit.decorator'
import { IAuthUser } from '@common/interfaces/auth-user.interface'
import { RateLimiterService } from '@common/rate-limiter/rate-limiter.service'
import { env } from '@configs/env'
import { CanActivate, ExecutionContext, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request, Response } from 'express'

/**
 * GUARD DE RATE LIMITING POR ROTA
 *
 * Permite aplicar políticas customizadas de rate limiting em rotas específicas.
 * Complementa o middleware global de rate limiting.
 *
 * Uso:
 * @RateLimit({ domain: 'login', windowMs: 60000, limit: 5, banSeconds: 300 })
 * @UseGuards(RateLimitGuard)
 * async login() { ... }
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(RateLimiterService)
    private readonly rateLimiterService: RateLimiterService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip rate limiting in test environment if disabled
    if (!env().RATE_LIMIT_ENABLED) {
      return true
    }

    // Verificar se há configuração @RateLimit no handler ou classe
    const customConfig = this.reflector.getAllAndOverride<RateLimitDecoratorConfig | undefined>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()]
    )

    // Se não há política customizada, permitir (middleware global já protege)
    if (customConfig === undefined || customConfig === null) {
      return true
    }

    const httpContext = context.switchToHttp()
    const request = httpContext.getRequest<Request & { user?: IAuthUser }>()
    const response = httpContext.getResponse<Response>()

    try {
      // Resolver identidade do usuário (IP ou user ID se autenticado)
      const identity = this.rateLimiterService.resolveIdentity(
        request,
        (req) => {
          // Se houver usuário autenticado, usar ID
          const user = (req as Request & { user?: IAuthUser }).user
          if (user?.id !== undefined && user.id !== null) {
            return `user:${user.id}`
          }
          // Caso contrário, usar IP
          return req.ip || 'unknown'
        }
      )

      // Converter configuração do decorator para política do serviço
      const policy = {
        domain: customConfig.domain,
        windowMs: customConfig.windowMs,
        maxRequests: customConfig.limit,
        banDurationMs: customConfig.banSeconds ? customConfig.banSeconds * 1000 : 300000,
        banThreshold: 5,
        prefix: 'ratelimit',
        limit: customConfig.limit,
        failClosed: true
      }

      // Aplicar política customizada
      await this.rateLimiterService.enforcePolicyCheckSlidingWindow(
        identity,
        policy,
        customConfig.domain
      )

      // Rate limit OK, prosseguir
      return true
    } catch (error: unknown) {
      // Rate limit excedido ou erro de validação
      const message = error instanceof Error && error.message
        ? error.message
        : 'Muitas requisições. Por favor, aguarde antes de tentar novamente.'

      // Retornar HTTP 429 Too Many Requests
      response.status(HttpStatus.TOO_MANY_REQUESTS).json({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message,
        error: 'Too Many Requests'
      })

      // Bloquear requisição
      return false
    }
  }
}
