import type { IAuthUser } from '@common/interfaces/auth-user.interface'
import { PERMISSIONS_KEY } from '@common/decorators/permissions.decorator'
import { Permission } from '@common/enums/permissions.enum'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()])

    if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
      return true // No permissions required
    }

    const request = context.switchToHttp().getRequest<{ user?: IAuthUser }>()
    const user = request.user

    if (typeof user !== 'object' || user === null || !Array.isArray(user.permissions)) {
      return false
    }

    // Check for admin wildcard permission
    if (user.permissions.includes(Permission.ADMIN_ALL)) {
      return true
    }

    return requiredPermissions.every((permission) => user.permissions?.includes(permission) ?? false)
  }
}
