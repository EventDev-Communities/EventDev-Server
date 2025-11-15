import { Permission } from '@common/enums/permissions.enum'
import { SetMetadata } from '@nestjs/common'

export const PERMISSIONS_KEY = 'permissions'
export const RequirePermissions = (...permissions: Permission[]) => SetMetadata(PERMISSIONS_KEY, permissions)
