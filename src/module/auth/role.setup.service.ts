import { Permission } from '@common/enums/permissions.enum'
import { UserRole } from '@common/enums/roles.enum'
import { LoggerService } from '@common/logger/logger.service'
import { IAuthAdapter } from '@infrastructure/auth/auth.adapter.interface'
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common'

@Injectable()
export class RoleSetupService implements OnApplicationBootstrap {
  constructor(
    @Inject('IAuthAdapter') private readonly authAdapter: IAuthAdapter,
    @Inject(LoggerService)
    private readonly logger: LoggerService
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Configurando papéis e permissões do sistema...', RoleSetupService.name)

    try {
      await this.setupPlatformAdminRole()
      await this.setupAdminRole()
      await this.setupCommunityRole()
      await this.setupUserRole()
      this.logger.log('Papéis e permissões configurados com sucesso!')
    } catch (error) {
      this.logger.error('Erro ao configurar papéis e permissões', error instanceof Error ? error.stack : String(error))
    }
  }

  private async setupPlatformAdminRole() {
    this.logger.debug('Configurando permissões PLATFORM_ADMIN')
    // PLATFORM_ADMIN tem wildcard - acesso total
    await this.authAdapter.addPermissionToRole(UserRole.PLATFORM_ADMIN, Permission.ADMIN_ALL)
  }

  private async setupAdminRole() {
    this.logger.debug('Configurando permissões ADMIN')
    // ADMIN pode gerenciar usuários e visualizar tudo
    const adminPermissions = [
      Permission.USER_CREATE,
      Permission.USER_READ_ALL,
      Permission.USER_UPDATE_ALL,
      Permission.USER_DELETE_ALL,
      Permission.COMMUNITY_READ_ALL,
      Permission.COMMUNITY_UPDATE_ALL,
      Permission.EVENT_READ_ALL,
      Permission.EVENT_MANAGE_ALL,
      Permission.TICKET_READ_ALL,
      Permission.TICKET_MANAGE_ALL,
      Permission.ORDER_READ_ALL,
      Permission.ORDER_UPDATE_ALL
    ]

    await Promise.all(
      adminPermissions.map(async (permission) =>
        await this.authAdapter.addPermissionToRole(UserRole.ADMIN, permission)
      )
    )
  }

  private async setupCommunityRole() {
    this.logger.debug('Configurando permissões COMMUNITY')
    // COMMUNITY pode gerenciar sua própria comunidade, eventos e tickets
    const communityPermissions = [
      Permission.COMMUNITY_CREATE,
      Permission.COMMUNITY_UPDATE_OWN,
      Permission.COMMUNITY_DELETE_OWN,
      Permission.EVENT_CREATE,
      Permission.EVENT_READ_ALL,
      Permission.EVENT_MANAGE_OWN,
      Permission.TICKET_CREATE,
      Permission.TICKET_READ_ALL,
      Permission.TICKET_MANAGE_OWN,
      Permission.ORDER_READ_OWN,
      Permission.ORDER_UPDATE_OWN
    ]

    await Promise.all(
      communityPermissions.map(async (permission) =>
        await this.authAdapter.addPermissionToRole(UserRole.COMMUNITY, permission)
      )
    )
  }

  private async setupUserRole() {
    this.logger.debug('Configurando permissões USER')
    // USER pode apenas visualizar e gerenciar seus próprios pedidos
    const userPermissions = [
      Permission.COMMUNITY_READ_ALL,
      Permission.EVENT_READ_ALL,
      Permission.TICKET_READ_ALL,
      Permission.ORDER_CREATE,
      Permission.ORDER_READ_OWN,
      Permission.ORDER_UPDATE_OWN
    ]

    await Promise.all(
      userPermissions.map(async (permission) =>
        await this.authAdapter.addPermissionToRole(UserRole.USER, permission)
      )
    )
  }
}
