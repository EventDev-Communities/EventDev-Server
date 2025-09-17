import { Module } from '@nestjs/common'
import { SuperTokensModule } from 'supertokens-nestjs'
import { APP_GUARD } from '@nestjs/core'
import { SuperTokensAuthGuard } from 'supertokens-nestjs'
import EmailPassword from 'supertokens-node/recipe/emailpassword'
import Session from 'supertokens-node/recipe/session'
import UserRoles from 'supertokens-node/recipe/userroles'
import { RoleSetupService } from './role.setup.service'
import { CommunityModule } from '../community/community.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import * as nodemailer from 'nodemailer';

@Module({
  imports: [
    CommunityModule,
    SuperTokensModule.forRoot({
      framework: 'express',
      supertokens: {
        connectionURI: 'http://supertokens-auth:3567'
      },
      appInfo: {
        appName: 'eventdev-server',
        apiDomain: process.env.NODE_ENV === 'production' ? 'https://api.eventdev.org' : 'http://127.0.0.1:5122',
        websiteDomain: process.env.NODE_ENV === 'production' ? 'https://eventdev.org' : 'http://127.0.0.1:5173'
      },
      recipeList: [
        EmailPassword.init({
          emailDelivery: {
            override: (original) => ({
              ...original,
              sendEmail: async (input) => {
                const transporter = nodemailer.createTransport({
                  host: process.env.SMTP_HOST || 'smtp.gmail.com',
                  port: Number(process.env.SMTP_PORT) || 587,
                  secure: false,
                  auth: {
                    user: process.env.SMTP_USER || 'usuario',
                    pass: process.env.SMTP_PASS || 'senha'
                  }
                });

                let subject = 'Redefinição de senha';
                let html = '';
                if ('passwordResetLink' in input) {
                  subject = 'Redefinição de senha';
                  html = `<h3>Event Dev</h3><p>Olá,</p><p>Para redefinir sua senha, clique no link abaixo:</p><p><a href="${input.passwordResetLink}">${input.passwordResetLink}</a></p>`;
                } else {
                  subject = 'Notificação EventDev';
                  html = '<p>Você recebeu uma notificação.</p>';
                }

                await transporter.sendMail({
                  from: process.env.SMTP_FROM || 'no-reply@eventdev.org',
                  to: input.user.email,
                  subject,
                  html
                });
              }
            })
          }
        }),
        Session.init(),
        UserRoles.init()
      ]
    })
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SuperTokensAuthGuard
    },
    RoleSetupService,
    AuthService
  ],
  controllers: [AuthController]
})
export class AuthModule {}
