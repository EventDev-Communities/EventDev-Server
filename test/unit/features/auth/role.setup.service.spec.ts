import { Permission } from '@common/enums/permissions.enum'
import { UserRole } from '@common/enums/roles.enum'
import { LoggerService } from '@common/logger/logger.service'
import { RoleSetupService } from '@module/auth/role.setup.service'
import { Test, TestingModule } from '@nestjs/testing'

describe('RoleSetupService', () => {
  let service: RoleSetupService
  let authAdapter: any
  let logger: any

  beforeEach(async () => {
    authAdapter = {
      addPermissionToRole: jest.fn()
    }
    logger = {
      log: jest.fn(),
      debug: jest.fn(),
      error: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleSetupService,
        { provide: 'IAuthAdapter', useValue: authAdapter },
        { provide: LoggerService, useValue: logger }
      ]
    }).compile()

    service = module.get<RoleSetupService>(RoleSetupService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('onApplicationBootstrap', () => {
    it('should setup all roles successfully', async () => {
      await service.onApplicationBootstrap()

      expect(logger.log).toHaveBeenCalledWith('Configurando papéis e permissões do sistema...', 'RoleSetupService')

      // Verify Platform Admin
      expect(authAdapter.addPermissionToRole).toHaveBeenCalledWith(UserRole.PLATFORM_ADMIN, Permission.ADMIN_ALL)

      // Verify Admin (sample check)
      expect(authAdapter.addPermissionToRole).toHaveBeenCalledWith(UserRole.ADMIN, Permission.USER_CREATE)

      // Verify Community (sample check)
      expect(authAdapter.addPermissionToRole).toHaveBeenCalledWith(UserRole.COMMUNITY, Permission.COMMUNITY_CREATE)

      // Verify User (sample check)
      expect(authAdapter.addPermissionToRole).toHaveBeenCalledWith(UserRole.USER, Permission.COMMUNITY_READ_ALL)

      expect(logger.log).toHaveBeenCalledWith('Papéis e permissões configurados com sucesso!')
    })

    it('should handle errors during setup', async () => {
      const error = new Error('Setup failed')
      authAdapter.addPermissionToRole.mockRejectedValueOnce(error)

      await service.onApplicationBootstrap()

      expect(logger.error).toHaveBeenCalledWith('Erro ao configurar papéis e permissões', error.stack)
    })

    it('should handle non-Error objects during setup', async () => {
      const error = 'Unknown error'
      authAdapter.addPermissionToRole.mockRejectedValueOnce(error)

      await service.onApplicationBootstrap()

      expect(logger.error).toHaveBeenCalledWith('Erro ao configurar papéis e permissões', 'Unknown error')
    })
  })
})
