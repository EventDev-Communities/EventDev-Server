import { Permission } from '@common/enums/permissions.enum'
import { UserRole } from '@common/enums/roles.enum'
import { IAuthUser, ISignInResult, ISignUpResult } from '@common/interfaces/auth-user.interface'
import { IAuthAdapter } from '@infrastructure/auth/auth.adapter.interface'
import { Injectable } from '@nestjs/common'
import supertokens from 'supertokens-node'
import { signIn, signUp, Error as STError } from 'supertokens-node/recipe/emailpassword'
import UserRoles from 'supertokens-node/recipe/userroles'

@Injectable()
export class SuperTokensAdapter implements IAuthAdapter {
  private readonly tenantId = 'public'

  async signUp(email: string, password: string): Promise<ISignUpResult> {
    try {
      const response = await signUp(this.tenantId, email, password)

      if (response.status === 'OK') {
        return {
          status: 'OK',
          user: {
            id: response.user.id,
            email: response.user.emails[0]
          }
        }
      }

      return { status: 'EMAIL_ALREADY_EXISTS' }
    } catch (error) {
      if (error instanceof STError) {
        return { status: 'EMAIL_ALREADY_EXISTS' }
      }
      throw error
    }
  }

  async signIn(email: string, password: string): Promise<ISignInResult> {
    try {
      const response = await signIn(this.tenantId, email, password)

      if (response.status === 'OK') {
        return {
          status: 'OK',
          user: {
            id: response.user.id,
            email: response.user.emails[0]
          }
        }
      }

      return { status: 'WRONG_CREDENTIALS' }
    } catch (error) {
      if (error instanceof STError) {
        return { status: 'WRONG_CREDENTIALS' }
      }
      throw error
    }
  }

  async getUserById(userId: string): Promise<IAuthUser | null> {
    try {
      const [roles, permissions, user] = await Promise.all([
        this.getUserRoles(userId),
        this.getUserPermissions(userId),
        supertokens.getUser(userId)
      ])

      if (!user) {
        return null
      }

      return {
        id: userId,
        email: user.emails[0] ?? '',
        roles,
        permissions
      }
    } catch {
      return null
    }
  }

  async addRoleToUser(userId: string, role: UserRole): Promise<void> {
    await UserRoles.addRoleToUser(this.tenantId, userId, role)
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    const result = await UserRoles.getRolesForUser(this.tenantId, userId)
    return result.roles as UserRole[]
  }

  async hasRole(userId: string, role: UserRole): Promise<boolean> {
    const roles = await this.getUserRoles(userId)
    return roles.includes(role)
  }

  async getUsersByRole(role: UserRole): Promise<string[]> {
    const result = await UserRoles.getUsersThatHaveRole(this.tenantId, role)
    return result.status === 'OK' ? result.users : []
  }

  async addPermissionToRole(role: UserRole, permission: Permission): Promise<void> {
    await UserRoles.createNewRoleOrAddPermissions(role, [permission])
  }

  async getPermissionsForRole(role: UserRole): Promise<Permission[]> {
    const result = await UserRoles.getPermissionsForRole(role as string)
    return result.status === 'OK' ? (result.permissions as Permission[]) : []
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const roles = await this.getUserRoles(userId)
    const permissionsPromises = roles.map(async (role) => await this.getPermissionsForRole(role))
    const permissionsArrays = await Promise.all(permissionsPromises)
    const allPermissions = [...new Set(permissionsArrays.flat())]
    return allPermissions
  }

  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId)

    // Check for wildcard admin permission
    if (permissions.includes(Permission.ADMIN_ALL)) {
      return true
    }

    return permissions.includes(permission)
  }

  async emailExists(email: string): Promise<boolean> {
    try {
      const users = await supertokens.listUsersByAccountInfo(this.tenantId, { email })
      return users.length > 0
    } catch {
      return false
    }
  }
}
