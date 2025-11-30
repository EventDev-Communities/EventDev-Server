import { LoggerModule } from '@common/logger/logger.module'
import { EmailModule } from '@infrastructure/email/email.module'
import { EmailService } from '@infrastructure/email/email.service'
import { MAILER_OPTIONS } from '@nestjs-modules/mailer'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

describe('EmailModule', () => {
  describe('Test Environment', () => {
    let module: TestingModule

    beforeEach(async () => {
      module = await Test.createTestingModule({
        imports: [
          EmailModule,
          LoggerModule,
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            load: [() => ({ NODE_ENV: 'test' })]
          })
        ]
      }).compile()
    })

    it('should be defined', () => {
      expect(module).toBeDefined()
      expect(module.get(EmailService)).toBeDefined()
    })

    it('should use JSON transport in test environment', () => {
      const options = module.get(MAILER_OPTIONS)
      expect(options).toBeDefined()
      expect(options.transport).toEqual({ jsonTransport: true })
      expect(options.defaults.from).toBe('test@example.com')
    })
  })

  describe('Production Environment', () => {
    let module: TestingModule

    beforeEach(async () => {
      module = await Test.createTestingModule({
        imports: [
          EmailModule,
          LoggerModule,
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            load: [
              () => ({
                NODE_ENV: 'production',
                SMTP_HOST: 'smtp.custom.com',
                SMTP_PORT: '2525',
                SMTP_SECURE: 'true',
                SMTP_USER: 'user@custom.com',
                SMTP_PASS: 'password',
                SMTP_FROM_NAME: 'Custom Name',
                SMTP_FROM_EMAIL: 'custom@example.com',
                SMTP_REPLY_TO: 'reply@example.com'
              })
            ]
          })
        ]
      }).compile()
    })

    it('should use SMTP transport in production environment', () => {
      const options = module.get(MAILER_OPTIONS)
      expect(options).toBeDefined()
      expect(options.transport).toEqual({
        host: 'smtp.custom.com',
        port: 2525,
        secure: true,
        auth: {
          user: 'user@custom.com',
          pass: 'password'
        }
      })
      expect(options.defaults.from).toBe('"Custom Name" <custom@example.com>')
      expect(options.defaults.replyTo).toBe('reply@example.com')
    })
  })

  describe('Default Configuration', () => {
    let module: TestingModule

    beforeEach(async () => {
      module = await Test.createTestingModule({
        imports: [EmailModule, LoggerModule]
      })
        .overrideProvider(ConfigService)
        .useValue({
          get: jest.fn((key: string) => {
            if (key === 'NODE_ENV') {
              return 'production'
            }
            return undefined
          })
        })
        .compile()
    })

    it('should use default SMTP settings when config is missing', () => {
      const options = module.get(MAILER_OPTIONS)
      expect(options).toBeDefined()
      expect(options.transport.host).toBe('smtp.gmail.com')
      expect(options.transport.port).toBe(587)
      expect(options.transport.secure).toBe(false)
      expect(options.transport.auth.user).toBe('')
      expect(options.transport.auth.pass).toBe('')
      expect(options.defaults.from).toBe('"EventDev" <>')
    })
  })
})
