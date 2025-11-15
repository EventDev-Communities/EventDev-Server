import { LoggerModule } from '@common/logger/logger.module'
import { SuperTokensAdapter } from '@infrastructure/auth/supertokens.adapter'
import { AuthController } from '@module/auth/auth.controller'
import { AuthService } from '@module/auth/auth.service'
import { RoleSetupService } from '@module/auth/role.setup.service'
import { CommunityModule } from '@module/community/community.module'
import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma/prisma.module'

@Module({
  imports: [
    LoggerModule,
    CommunityModule,
    PrismaModule
  ],
  providers: [
    {
      provide: 'IAuthAdapter',
      useClass: SuperTokensAdapter
    },
    AuthService,
    RoleSetupService
  ],
  controllers: [AuthController],
  exports: ['IAuthAdapter', AuthService, RoleSetupService]
})
export class AuthModule {}
