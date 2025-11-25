import { LoggerService } from '@common/logger/logger.service'
import { MailerService } from '@nestjs-modules/mailer'
import { Inject, Injectable } from '@nestjs/common'

@Injectable()
export class EmailService {
  constructor(
    @Inject(MailerService) private readonly mailerService: MailerService,
    @Inject(LoggerService) private readonly logger: LoggerService
  ) {}

  async sendPasswordResetEmail(to: string, resetLink: string) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Recuperação de Senha - EventDev',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Recuperação de Senha</h2>
            <p>Você solicitou a recuperação de senha para sua conta no EventDev.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Redefinir Senha</a>
            <p>Se você não solicitou isso, ignore este email.</p>
            <p>O link expira em 1 hora.</p>
          </div>
        `
      })
      this.logger.log(`Email de recuperação enviado para [REDACTED]`)
      return true
    } catch (error) {
      this.logger.error(`Erro ao enviar email para [REDACTED]`, error instanceof Error ? error.stack : String(error))
      return false
    }
  }
}
