import type { IAuthUser } from '@common/interfaces/auth-user.interface'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): IAuthUser => {
  const request = ctx.switchToHttp().getRequest<{ user: IAuthUser }>()

  // The user object is populated by SuperTokensAuthGuard and enriched by RolesGuard
  return request.user
})
