import { Module } from '@nestjs/common';
import { SuperTokensModule } from 'supertokens-nestjs';
import { APP_GUARD } from '@nestjs/core';
import { SuperTokensAuthGuard } from 'supertokens-nestjs';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import Session from 'supertokens-node/recipe/session';
import UserRoles from 'supertokens-node/recipe/userroles'; // 1. Importe a receita
import { RoleSetupService } from './role.setup.service';
import { CommunityModule } from '../community/community.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    CommunityModule,
    SuperTokensModule.forRoot({
      framework: 'express',
      supertokens: {
        connectionURI: 'http://localhost:3567'
      },
      appInfo: {
        appName: 'Event-Dev-Server',
        apiDomain: 'http://localhost:5122',
        websiteDomain: 'http://localhost:5173',
      },
      recipeList: [
        EmailPassword.init(),
        Session.init(),
        UserRoles.init(),
      ],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SuperTokensAuthGuard,
    },
    RoleSetupService,
    AuthService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
