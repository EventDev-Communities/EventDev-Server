import { Permission } from '@common/enums/permissions.enum'
import { UserRole } from '@common/enums/roles.enum'

export interface IAuthUser {
  id: string
  email: string
  roles: UserRole[]
  permissions?: Permission[]
  communityId?: number
  internalId?: number
}

export interface IAuthSession {
  userId: string
  sessionHandle: string
}

export interface ISignUpResult {
  status: 'OK' | 'EMAIL_ALREADY_EXISTS'
  user?: {
    id: string
    email: string
  }
}

export interface ISignInResult {
  status: 'OK' | 'WRONG_CREDENTIALS'
  user?: {
    id: string
    email: string
  }
}
