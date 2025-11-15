import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { SuperTokensAuthGuard } from 'supertokens-nestjs'

@Injectable()
export class CustomSuperTokensAuthGuard extends SuperTokensAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const result = await super.canActivate(context)
      return Boolean(result)
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
