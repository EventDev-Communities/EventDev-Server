import { ROLES_KEY } from '@common/decorators/roles.decorator'
import { UserRole } from '@common/enums/roles.enum'
import { IAuthUser } from '@common/interfaces/auth-user.interface'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [context.getHandler(), context.getClass()])

    if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) {
      return true // No roles required
    }

    const request = context.switchToHttp().getRequest<{ user?: IAuthUser }>()
    const user = request.user

    if (typeof user !== 'object' || user === null || !Array.isArray(user.roles)) {
      return false
    }

    // Platform admin has access to everything
    if (user.roles.includes(UserRole.PLATFORM_ADMIN)) {
      return true
    }

    return requiredRoles.some((role) => user.roles.includes(role))
  }
}
