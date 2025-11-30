import { Permission } from '@common/enums/permissions.enum'
import { UserRole } from '@common/enums/roles.enum'
import { SuperTokensAdapter } from '@infrastructure/auth/supertokens.adapter'
import { Test, TestingModule } from '@nestjs/testing'
import supertokens from 'supertokens-node'
import { signIn, signUp, Error as STError } from 'supertokens-node/recipe/emailpassword'
import UserRoles from 'supertokens-node/recipe/userroles'

// Mock SuperTokens
jest.mock('supertokens-node', () => ({
  getUser: jest.fn(),
  listUsersByAccountInfo: jest.fn()
}))

jest.mock('supertokens-node/recipe/emailpassword', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  Error: class {}
}))

jest.mock('supertokens-node/recipe/userroles', () => ({
  addRoleToUser: jest.fn(),
  getRolesForUser: jest.fn(),
  getUsersThatHaveRole: jest.fn(),
  createNewRoleOrAddPermissions: jest.fn(),
  getPermissionsForRole: jest.fn()
}))

describe('SuperTokensAdapter', () => {
  let adapter: SuperTokensAdapter

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuperTokensAdapter]
    }).compile()

    adapter = module.get<SuperTokensAdapter>(SuperTokensAdapter)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(adapter).toBeDefined()
  })

  describe('signUp', () => {
    it('should sign up a user successfully', async () => {
      ;(signUp as jest.Mock).mockResolvedValue({
        status: 'OK',
        user: { id: 'user-123', emails: ['test@example.com'] }
      })

      const result = await adapter.signUp('test@example.com', 'password')
      expect(result).toEqual({
        status: 'OK',
        user: { id: 'user-123', email: 'test@example.com' }
      })
    })

    it('should return EMAIL_ALREADY_EXISTS if email exists', async () => {
      ;(signUp as jest.Mock).mockResolvedValue({ status: 'EMAIL_ALREADY_EXISTS' })

      const result = await adapter.signUp('test@example.com', 'password')
      expect(result).toEqual({ status: 'EMAIL_ALREADY_EXISTS' })
    })
  })

  describe('signIn', () => {
    it('should sign in a user successfully', async () => {
      ;(signIn as jest.Mock).mockResolvedValue({
        status: 'OK',
        user: { id: 'user-123', emails: ['test@example.com'] }
      })

      const result = await adapter.signIn('test@example.com', 'password')
      expect(result).toEqual({
        status: 'OK',
        user: { id: 'user-123', email: 'test@example.com' }
      })
    })

    it('should return WRONG_CREDENTIALS if failed', async () => {
      ;(signIn as jest.Mock).mockResolvedValue({ status: 'WRONG_CREDENTIALS' })

      const result = await adapter.signIn('test@example.com', 'password')
      expect(result).toEqual({ status: 'WRONG_CREDENTIALS' })
    })

    it('should handle SuperTokens Error', async () => {
      ;(signIn as jest.Mock).mockRejectedValue(new STError({ message: 'Error' } as any))
      const result = await adapter.signIn('test@example.com', 'password')
      expect(result).toEqual({ status: 'WRONG_CREDENTIALS' })
    })

    it('should throw other errors', async () => {
      ;(signIn as jest.Mock).mockRejectedValue(new Error('Unexpected'))
      await expect(adapter.signIn('test@example.com', 'password')).rejects.toThrow('Unexpected')
    })
  })

  describe('getUserById', () => {
    it('should return user with roles and permissions', async () => {
      ;(UserRoles.getRolesForUser as jest.Mock).mockResolvedValue({ roles: [UserRole.USER] })
      ;(UserRoles.getPermissionsForRole as jest.Mock).mockResolvedValue({ status: 'OK', permissions: [Permission.COMMUNITY_READ] })
      ;(supertokens.getUser as jest.Mock).mockResolvedValue({ emails: ['test@example.com'] })

      const result = await adapter.getUserById('user-123')
      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        roles: [UserRole.USER],
        permissions: [Permission.COMMUNITY_READ]
      })
    })

    it('should return null if user not found', async () => {
      ;(UserRoles.getRolesForUser as jest.Mock).mockResolvedValue({ roles: [] })
      ;(UserRoles.getPermissionsForRole as jest.Mock).mockResolvedValue({ status: 'OK', permissions: [] })
      ;(supertokens.getUser as jest.Mock).mockResolvedValue(undefined)

      const result = await adapter.getUserById('user-123')
      expect(result).toBeNull()
    })

    it('should return null on error', async () => {
      ;(supertokens.getUser as jest.Mock).mockRejectedValue(new Error('Error'))
      const result = await adapter.getUserById('user-123')
      expect(result).toBeNull()
    })
  })

  describe('addRoleToUser', () => {
    it('should add role to user', async () => {
      await adapter.addRoleToUser('user-123', UserRole.ADMIN)
      expect(UserRoles.addRoleToUser).toHaveBeenCalledWith('public', 'user-123', UserRole.ADMIN)
    })
  })

  describe('hasRole', () => {
    it('should return true if user has role', async () => {
      ;(UserRoles.getRolesForUser as jest.Mock).mockResolvedValue({ roles: [UserRole.ADMIN] })
      const result = await adapter.hasRole('user-123', UserRole.ADMIN)
      expect(result).toBe(true)
    })
  })

  describe('getUsersByRole', () => {
    it('should return users with role', async () => {
      ;(UserRoles.getUsersThatHaveRole as jest.Mock).mockResolvedValue({ status: 'OK', users: ['user-123'] })
      const result = await adapter.getUsersByRole(UserRole.ADMIN)
      expect(result).toEqual(['user-123'])
    })
  })

  describe('addPermissionToRole', () => {
    it('should add permission to role', async () => {
      await adapter.addPermissionToRole(UserRole.ADMIN, Permission.ADMIN_ALL)
      expect(UserRoles.createNewRoleOrAddPermissions).toHaveBeenCalledWith(UserRole.ADMIN, [Permission.ADMIN_ALL])
    })
  })

  describe('hasPermission', () => {
    it('should return true if user has permission', async () => {
      ;(UserRoles.getRolesForUser as jest.Mock).mockResolvedValue({ roles: [UserRole.USER] })
      ;(UserRoles.getPermissionsForRole as jest.Mock).mockResolvedValue({ status: 'OK', permissions: [Permission.COMMUNITY_READ] })

      const result = await adapter.hasPermission('user-123', Permission.COMMUNITY_READ)
      expect(result).toBe(true)
    })

    it('should return true if user has ADMIN_ALL permission', async () => {
      ;(UserRoles.getRolesForUser as jest.Mock).mockResolvedValue({ roles: [UserRole.ADMIN] })
      ;(UserRoles.getPermissionsForRole as jest.Mock).mockResolvedValue({ status: 'OK', permissions: [Permission.ADMIN_ALL] })

      const result = await adapter.hasPermission('user-123', Permission.COMMUNITY_READ)
      expect(result).toBe(true)
    })
  })

  describe('emailExists', () => {
    it('should return true if email exists', async () => {
      ;(supertokens.listUsersByAccountInfo as jest.Mock).mockResolvedValue(['user'])
      const result = await adapter.emailExists('test@example.com')
      expect(result).toBe(true)
    })

    it('should return false if email does not exist', async () => {
      ;(supertokens.listUsersByAccountInfo as jest.Mock).mockResolvedValue([])
      const result = await adapter.emailExists('test@example.com')
      expect(result).toBe(false)
    })

    it('should return false on error', async () => {
      ;(supertokens.listUsersByAccountInfo as jest.Mock).mockRejectedValue(new Error('Error'))
      const result = await adapter.emailExists('test@example.com')
      expect(result).toBe(false)
    })
  })
})
