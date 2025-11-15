import { IAuthUser } from '@common/interfaces/auth-user.interface'
import { LoggerService } from '@common/logger/logger.service'
import { IAuthAdapter } from '@infrastructure/auth/auth.adapter.interface'
import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

interface SessionContainer {
  getUserId: () => string
}

declare global {
  namespace Express {
    interface Request {
      user?: IAuthUser
      session?: SessionContainer
    }
  }
}

@Injectable()
export class AuthContextMiddleware implements NestMiddleware {
  constructor(
    @Inject('IAuthAdapter') private readonly authAdapter: IAuthAdapter,
    private readonly logger: LoggerService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // SuperTokens populates req.session after SuperTokensAuthGuard
    // This middleware enriches req.user with roles and permissions
    try {
      if (typeof req.session === 'object' && req.session !== null && typeof req.session.getUserId === 'function') {
        const userId = req.session.getUserId()

        const authUser = await this.authAdapter.getUserById(userId)

        if (authUser) {
          req.user = {
            ...authUser,
            communityId: authUser.communityId ?? undefined
          }
        }
      }
    } catch (error: unknown) {
      // Se houver erro ao buscar dados do usuário, apenas ignora
      // O guard vai lidar com a autenticação
      const errorWithMessage = error !== null && error !== undefined && typeof error === 'object' && 'message' in error ? error as { message: unknown } : null
      const errorMessage = errorWithMessage && typeof errorWithMessage.message === 'string' ? errorWithMessage.message : 'Unknown error'
      this.logger.debug('Error enriching user context', { error: errorMessage })
    }

    next()
  }
}
