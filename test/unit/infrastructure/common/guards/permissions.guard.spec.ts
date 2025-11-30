import { Permission } from '@common/enums/permissions.enum'
import { PermissionsGuard } from '@common/guards/permissions.guard'
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

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard
  let reflector: Reflector
  let moduleRef: TestingModule

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn()
          }
        }
      ]
    }).compile()

    guard = moduleRef.get<PermissionsGuard>(PermissionsGuard)
    reflector = moduleRef.get<Reflector>(Reflector)
  })

  afterEach(async () => {
    await moduleRef.close()
  })

  it('should be defined', () => {
    expect(guard).toBeDefined()
  })

  it('should allow access if no permissions are required', async () => {
    const mockContext = createMockExecutionContext()
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined)

    const result = await guard.canActivate(mockContext)

    expect(result).toBe(true)
  })

  it('should deny access if user has no permissions', async () => {
    const user: IAuthUser = {
      id: '1',
      email: 'user@test.com',
      roles: [],
      permissions: undefined
    }

    const mockContext = createMockExecutionContext(user)
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.EVENT_CREATE])

    const result = await guard.canActivate(mockContext)

    expect(result).toBe(false)
  })

  it('should allow access if user has required permission', async () => {
    const user: IAuthUser = {
      id: '1',
      email: 'community@test.com',
      roles: [],
      permissions: [Permission.EVENT_CREATE, Permission.EVENT_READ]
    }

    const mockContext = createMockExecutionContext(user)
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.EVENT_CREATE])

    const result = await guard.canActivate(mockContext)

    expect(result).toBe(true)
  })

  it('should deny access if user lacks one of multiple required permissions', async () => {
    const user: IAuthUser = {
      id: '1',
      email: 'user@test.com',
      roles: [],
      permissions: [Permission.EVENT_READ]
    }

    const mockContext = createMockExecutionContext(user)
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.EVENT_CREATE, Permission.EVENT_UPDATE])

    const result = await guard.canActivate(mockContext)

    expect(result).toBe(false)
  })

  it('should allow access if user has ADMIN_ALL wildcard permission', async () => {
    const user: IAuthUser = {
      id: '1',
      email: 'admin@test.com',
      roles: [],
      permissions: [Permission.ADMIN_ALL]
    }

    const mockContext = createMockExecutionContext(user)
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.EVENT_CREATE, Permission.EVENT_DELETE])

    const result = await guard.canActivate(mockContext)

    expect(result).toBe(true)
  })

  it('should allow access if user has all required permissions', async () => {
    const user: IAuthUser = {
      id: '1',
      email: 'community@test.com',
      roles: [],
      permissions: [Permission.EVENT_CREATE, Permission.EVENT_READ, Permission.EVENT_UPDATE]
    }

    const mockContext = createMockExecutionContext(user)
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.EVENT_CREATE, Permission.EVENT_UPDATE])

    const result = await guard.canActivate(mockContext)

    expect(result).toBe(true)
  })
})
