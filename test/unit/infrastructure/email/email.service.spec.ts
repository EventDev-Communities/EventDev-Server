import { LoggerService } from '@common/logger/logger.service'
import { EmailService } from '@infrastructure/email/email.service'
import { MailerService } from '@nestjs-modules/mailer'
import { Test, TestingModule } from '@nestjs/testing'
import * as QRCode from 'qrcode'

jest.mock('qrcode', () => ({
  toDataURL: jest.fn()
}))

const mockMailerService = {
  sendMail: jest.fn()
}

const mockLoggerService = {
  log: jest.fn(),
  error: jest.fn()
}

describe('EmailService', () => {
  let service: EmailService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: MailerService, useValue: mockMailerService },
        { provide: LoggerService, useValue: mockLoggerService }
      ]
    }).compile()

    service = module.get<EmailService>(EmailService)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      mockMailerService.sendMail.mockResolvedValue(true)
      const result = await service.sendPasswordResetEmail('test@example.com', 'http://reset-link')
      expect(result).toBe(true)
      expect(mockMailerService.sendMail).toHaveBeenCalled()
      expect(mockLoggerService.log).toHaveBeenCalled()
    })

    it('should handle error when sending password reset email', async () => {
      mockMailerService.sendMail.mockRejectedValue(new Error('Send error'))
      const result = await service.sendPasswordResetEmail('test@example.com', 'http://reset-link')
      expect(result).toBe(false)
      expect(mockLoggerService.error).toHaveBeenCalled()
    })

    it('should handle non-Error objects when sending password reset email', async () => {
      mockMailerService.sendMail.mockRejectedValue('String error')
      const result = await service.sendPasswordResetEmail('test@example.com', 'http://reset-link')
      expect(result).toBe(false)
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao enviar email'),
        'String error'
      )
    })
  })

  describe('sendInvitationEmail', () => {
    it('should send invitation email successfully', async () => {
      mockMailerService.sendMail.mockResolvedValue(true)
      const result = await service.sendInvitationEmail('test@example.com', 'http://invite-link', 'Community')
      expect(result).toBe(true)
      expect(mockMailerService.sendMail).toHaveBeenCalled()
      expect(mockLoggerService.log).toHaveBeenCalled()
    })

    it('should handle error when sending invitation email', async () => {
      mockMailerService.sendMail.mockRejectedValue(new Error('Send error'))
      const result = await service.sendInvitationEmail('test@example.com', 'http://invite-link', 'Community')
      expect(result).toBe(false)
      expect(mockLoggerService.error).toHaveBeenCalled()
    })

    it('should handle non-Error objects when sending invitation email', async () => {
      mockMailerService.sendMail.mockRejectedValue('String error')
      const result = await service.sendInvitationEmail('test@example.com', 'http://invite-link', 'Community')
      expect(result).toBe(false)
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao enviar convite'),
        'String error'
      )
    })
  })

  describe('sendTicketEmail', () => {
    it('should send ticket email successfully', async () => {
      mockMailerService.sendMail.mockResolvedValue(true)
      ;(QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,qrcode')

      const tickets = [
        { id: 1, eventName: 'Event', ticketType: 'VIP', participantName: 'User' }
      ]

      const result = await service.sendTicketEmail('test@example.com', tickets)
      expect(result).toBe(true)
      expect(mockMailerService.sendMail).toHaveBeenCalled()
      expect(QRCode.toDataURL).toHaveBeenCalledWith('1')
      expect(mockLoggerService.log).toHaveBeenCalled()
    })

    it('should handle error when sending ticket email', async () => {
      mockMailerService.sendMail.mockRejectedValue(new Error('Send error'))
      ;(QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,qrcode')

      const tickets = [
        { id: 1, eventName: 'Event', ticketType: 'VIP', participantName: 'User' }
      ]

      const result = await service.sendTicketEmail('test@example.com', tickets)
      expect(result).toBe(false)
      expect(mockLoggerService.error).toHaveBeenCalled()
    })

    it('should handle non-Error objects when sending ticket email', async () => {
      mockMailerService.sendMail.mockRejectedValue('String error')
      ;(QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,qrcode')

      const tickets = [
        { id: 1, eventName: 'Event', ticketType: 'VIP', participantName: 'User' }
      ]

      const result = await service.sendTicketEmail('test@example.com', tickets)
      expect(result).toBe(false)
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao enviar email'),
        'String error'
      )
    })
  })
})
