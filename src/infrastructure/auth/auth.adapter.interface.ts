import type { IAuthUser, ISignInResult, ISignUpResult } from '@common/interfaces/auth-user.interface'
import { Permission } from '@common/enums/permissions.enum'
import { UserRole } from '@common/enums/roles.enum'

export interface IAuthAdapter {
  /**
   * Sign up a new user
   */
  signUp: (email: string, password: string) => Promise<ISignUpResult>

  /**
   * Sign in a user
   */
  signIn: (email: string, password: string) => Promise<ISignInResult>

  /**
   * Get user by ID
   */
  getUserById: (userId: string) => Promise<IAuthUser | null>

  /**
   * Add role to user
   */
  addRoleToUser: (userId: string, role: UserRole) => Promise<void>

  /**
   * Get user roles
   */
  getUserRoles: (userId: string) => Promise<UserRole[]>

  /**
   * Check if user has role
   */
  hasRole: (userId: string, role: UserRole) => Promise<boolean>

  /**
   * Get users by role
   */
  getUsersByRole: (role: UserRole) => Promise<string[]>

  /**
   * Add permission to role
   */
  addPermissionToRole: (role: UserRole, permission: Permission) => Promise<void>

  /**
   * Get permissions for a specific role
   */
  getPermissionsForRole: (role: UserRole) => Promise<Permission[]>

  /**
   * Get permissions for user
   */
  getUserPermissions: (userId: string) => Promise<Permission[]>

  /**
   * Check if user has permission
   */
  hasPermission: (userId: string, permission: Permission) => Promise<boolean>

  /**
   * Verify if email exists
   */
  emailExists: (email: string) => Promise<boolean>
}
