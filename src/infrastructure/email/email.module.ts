import { EmailService } from '@infrastructure/email/email.service'
import { MailerModule } from '@nestjs-modules/mailer'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST') ?? 'smtp.gmail.com',
          port: Number.parseInt(configService.get<string>('SMTP_PORT') ?? '587', 10),
          secure: configService.get<string>('SMTP_SECURE') === 'true',
          auth: {
            user: configService.get<string>('SMTP_USER') ?? '',
            pass: configService.get<string>('SMTP_PASS') ?? ''
          }
        },
        defaults: {
          from: `"${configService.get<string>('SMTP_FROM_NAME') ?? 'EventDev'}" <${configService.get<string>('SMTP_FROM_EMAIL') ?? configService.get<string>('SMTP_USER') ?? ''}>`,
          replyTo: configService.get<string>('SMTP_REPLY_TO')
        }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [EmailService],
  exports: [EmailService]
})
export class EmailModule {}
