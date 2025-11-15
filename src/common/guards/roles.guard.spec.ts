import { UserRole } from '@common/enums/roles.enum'
import { RolesGuard } from '@common/guards/roles.guard'
import { IAuthUser } from '@common/interfaces/auth-user.interface'
import { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'

function createMockExecutionContext(user?: IAuthUser): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user })
    }),
    getHandler: jest.fn(),
    getClass: jest.fn()
  } as any
}

describe('RolesGuard', () => {
  let guard: RolesGuard
  let reflector: Reflector

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn()
          }
        }
      ]
    }).compile()

    guard = module.get<RolesGuard>(RolesGuard)
    reflector = module.get<Reflector>(Reflector)
  })

  it('should be defined', () => {
    expect(guard).toBeDefined()
  })

  it('should allow access if no roles are required', async () => {
    const mockContext = createMockExecutionContext()
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined)

    const result = await guard.canActivate(mockContext)

    expect(result).toBe(true)
  })

  it('should deny access if user is not authenticated', async () => {
    const mockContext = createMockExecutionContext()
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN])

    const result = await guard.canActivate(mockContext)

    expect(result).toBe(false)
  })

  it('should allow access if user has required role', async () => {
    const user: IAuthUser = {
      id: '1',
      email: 'admin@test.com',
      roles: [UserRole.ADMIN],
      permissions: []
    }

    const mockContext = createMockExecutionContext(user)
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN])

    const result = await guard.canActivate(mockContext)

    expect(result).toBe(true)
  })

  it('should deny access if user does not have required role', async () => {
    const user: IAuthUser = {
      id: '1',
      email: 'user@test.com',
      roles: [UserRole.USER],
      permissions: []
    }

    const mockContext = createMockExecutionContext(user)
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN])

    const result = await guard.canActivate(mockContext)

    expect(result).toBe(false)
  })

  it('should allow access if user has one of multiple required roles', async () => {
    const user: IAuthUser = {
      id: '1',
      email: 'community@test.com',
      roles: [UserRole.COMMUNITY],
      permissions: []
    }

    const mockContext = createMockExecutionContext(user)
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN, UserRole.COMMUNITY])

    const result = await guard.canActivate(mockContext)

    expect(result).toBe(true)
  })

  it('should allow platform admin access to any role-protected resource', async () => {
    const user: IAuthUser = {
      id: '1',
      email: 'platformadmin@test.com',
      roles: [UserRole.PLATFORM_ADMIN],
      permissions: []
    }

    const mockContext = createMockExecutionContext(user)
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN])

    const result = await guard.canActivate(mockContext)

    expect(result).toBe(true)
  })
})
