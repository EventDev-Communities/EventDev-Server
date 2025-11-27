import { LoggerService } from '@common/logger/logger.service'
import { MailerService } from '@nestjs-modules/mailer'
import { Inject, Injectable } from '@nestjs/common'
import * as QRCode from 'qrcode'

export interface TicketEmailData {
  id: number
  eventName: string
  ticketType: string
  participantName: string
}

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

  async sendInvitationEmail(to: string, inviteLink: string, communityName: string) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: `Convite para participar da comunidade ${communityName} - EventDev`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Você foi convidado!</h2>
            <p>Você recebeu um convite para se juntar à comunidade <strong>${communityName}</strong> no EventDev.</p>
            <p>Clique no botão abaixo para aceitar o convite e criar sua conta:</p>
            <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Aceitar Convite</a>
            <p>Se você não esperava este convite, pode ignorar este email.</p>
            <p>O link expira em 7 dias.</p>
          </div>
        `
      })
      this.logger.log(`Email de convite enviado para [REDACTED]`)
      return true
    } catch (error) {
      this.logger.error(`Erro ao enviar convite para [REDACTED]`, error instanceof Error ? error.stack : String(error))
      return false
    }
  }

  async sendTicketEmail(to: string, tickets: TicketEmailData[]) {
    try {
      const ticketsHtml = await Promise.all(
        tickets.map(async (ticket) => {
          const qrCodeDataUrl = await QRCode.toDataURL(String(ticket.id))
          return `
            <div style="border: 1px solid #ccc; padding: 20px; margin-bottom: 20px; border-radius: 10px;">
              <h3>${ticket.eventName}</h3>
              <p><strong>Participante:</strong> ${ticket.participantName}</p>
              <p><strong>Tipo:</strong> ${ticket.ticketType}</p>
              <p><strong>Ticket ID:</strong> #${ticket.id}</p>
              <div style="text-align: center; margin-top: 15px;">
                <img src="${qrCodeDataUrl}" alt="QR Code do Ticket #${ticket.id}" style="width: 200px; height: 200px;" />
                <p style="font-size: 12px; color: #666;">Apresente este QR Code na entrada</p>
              </div>
            </div>
          `
        })
      )

      await this.mailerService.sendMail({
        to,
        subject: 'Seus ingressos chegaram! - EventDev',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Pagamento Confirmado!</h2>
            <p>Olá,</p>
            <p>Seu pagamento foi confirmado e seus ingressos já estão disponíveis.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            ${ticketsHtml.join('')}
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p>Bom evento!</p>
          </div>
        `
      })
      this.logger.log(`Email de tickets enviado para [REDACTED]`)
      return true
    } catch (error) {
      this.logger.error(`Erro ao enviar email de tickets para [REDACTED]`, error instanceof Error ? error.stack : String(error))
      return false
    }
  }
}
