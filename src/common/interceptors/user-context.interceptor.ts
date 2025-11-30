import type { IAuthAdapter } from '@infrastructure/auth/auth.adapter.interface'
import { IAuthUser } from '@common/interfaces/auth-user.interface'
import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common'
import { Request } from 'express'
import { Observable } from 'rxjs'

interface SessionContainer {
  getUserId: () => string
}

interface AuthenticatedRequest extends Request {
  session?: SessionContainer
  user?: IAuthUser
}

@Injectable()
export class UserContextInterceptor implements NestInterceptor {
  constructor(
    @Inject('IAuthAdapter') private readonly authAdapter: IAuthAdapter
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const session = request.session

    if (session && typeof session.getUserId === 'function' && !request.user) {
      const userId = session.getUserId()
      const user = await this.authAdapter.getUserById(userId)
      if (user) {
        request.user = user
      }
    }

    return next.handle()
  }
}
