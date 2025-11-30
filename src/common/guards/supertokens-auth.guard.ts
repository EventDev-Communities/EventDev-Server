import type { IAuthAdapter } from '@infrastructure/auth/auth.adapter.interface'
import { IAuthUser } from '@common/interfaces/auth-user.interface'
import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { SuperTokensAuthGuard } from 'supertokens-nestjs'

interface SessionContainer {
  getUserId: () => string
}

interface AuthenticatedRequest extends Request {
  session?: SessionContainer
  user?: IAuthUser
}

@Injectable()
export class CustomSuperTokensAuthGuard extends SuperTokensAuthGuard implements CanActivate {
  constructor(
    @Inject('IAuthAdapter') private readonly authAdapter: IAuthAdapter
  ) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const result = await super.canActivate(context)

      if (!result) {
        return false
      }

      const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
      const session = request.session

      if (!session || typeof session.getUserId !== 'function') {
        return true
      }

      const userId = session.getUserId()
      const user = await this.authAdapter.getUserById(userId)

      if (!user) {
        console.warn(`[CustomSuperTokensAuthGuard] User not found for ID: ${userId}`)
        return true
      }

      request.user = user
      return true
    } catch (error: unknown) {
      this.handleAuthError(error)
      throw error
    }
  }

  private handleAuthError(error: unknown): void {
    // Se o erro for relacionado a sessão, retornar 401 ao invés de 500
    if (this.isUnauthorisedError(error)) {
      throw new UnauthorizedException('Sessão inválida ou expirada')
    }

    // Se for qualquer outro erro de sessão do SuperTokens
    if (this.isSessionError(error)) {
      throw new UnauthorizedException('Autenticação necessária')
    }
  }

  private isUnauthorisedError(error: unknown): boolean {
    if (error === null || error === undefined || typeof error !== 'object' || !('type' in error)) {
      return false
    }
    const errorWithType = error as { type: string }
    return errorWithType.type === 'UNAUTHORISED'
  }

  private isSessionError(error: unknown): boolean {
    if (error === null || error === undefined || typeof error !== 'object' || !('message' in error)) {
      return false
    }
    const errorWithMessage = error as { message: unknown }
    const message = typeof errorWithMessage.message === 'string' ? errorWithMessage.message.toLowerCase() : ''
    return message.includes('session') || message.includes('unauthorised') || message.includes('unauthorized')
  }
}
