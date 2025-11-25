import { LoggerService } from '@common/logger/logger.service'
import { EmailService } from '@infrastructure/email/email.service'
import { MailerService } from '@nestjs-modules/mailer'
import { Test, TestingModule } from '@nestjs/testing'

describe('EmailService', () => {
  let service: EmailService

  const mockMailerService = {
    sendMail: jest.fn()
  }

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: mockMailerService
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService
        }
      ]
    }).compile()

    service = module.get<EmailService>(EmailService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('sendPasswordResetEmail', () => {
    it('should send email successfully', async () => {
      mockMailerService.sendMail.mockResolvedValue(true)

      const result = await service.sendPasswordResetEmail('test@example.com', 'http://reset-link')

      expect(result).toBe(true)
      expect(mockMailerService.sendMail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Recuperação de Senha - EventDev',
        html: expect.stringContaining('http://reset-link')
      })
    })

    it('should return false on error', async () => {
      mockMailerService.sendMail.mockRejectedValue(new Error('SMTP Error'))

      const result = await service.sendPasswordResetEmail('test@example.com', 'http://reset-link')

      expect(result).toBe(false)
    })
  })
})
