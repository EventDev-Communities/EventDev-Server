import { LoggerService } from '@common/logger/logger.service'
import { OrderService } from '@module/order/order.service'
import { OrderWebhookController } from '@module/order/order.webhook.controller'
import { ForbiddenException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

describe('OrderWebhookController', () => {
  let controller: OrderWebhookController
  // let service: OrderService

  const mockOrderService = {
    validateWebhookSignature: jest.fn(),
    handlePaymentWebhook: jest.fn()
  }

  const mockLogger = {
    log: jest.fn(),
    warn: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderWebhookController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService
        },
        {
          provide: LoggerService,
          useValue: mockLogger
        }
      ]
    }).compile()

    controller = module.get<OrderWebhookController>(OrderWebhookController)
    // service = module.get<OrderService>(OrderService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('handleMercadoPagoWebhook', () => {
    it('should handle webhook successfully', async () => {
      const body = { type: 'payment', data: { id: '123' } }
      const signature = 'sig'
      const requestId = 'req-id'

      mockOrderService.validateWebhookSignature.mockReturnValue(true)
      mockOrderService.handlePaymentWebhook.mockResolvedValue(undefined)

      const result = await controller.handleMercadoPagoWebhook(body, signature, requestId)

      expect(result).toEqual({ status: 'ok' })
      expect(mockOrderService.validateWebhookSignature).toHaveBeenCalledWith('123', requestId, signature)
      expect(mockOrderService.handlePaymentWebhook).toHaveBeenCalledWith('123')
    })

    it('should throw ForbiddenException if headers are missing', async () => {
      const body = { type: 'payment', data: { id: '123' } }
      await expect(controller.handleMercadoPagoWebhook(body, '', '')).rejects.toThrow(ForbiddenException)
    })

    it('should return ok if data.id is missing', async () => {
      const body = { type: 'payment', data: {} } as any
      const signature = 'sig'
      const requestId = 'req-id'

      const result = await controller.handleMercadoPagoWebhook(body, signature, requestId)
      expect(result).toEqual({ status: 'ok' })
    })

    it('should throw ForbiddenException if signature is invalid', async () => {
      const body = { type: 'payment', data: { id: '123' } }
      const signature = 'sig'
      const requestId = 'req-id'

      mockOrderService.validateWebhookSignature.mockReturnValue(false)

      await expect(controller.handleMercadoPagoWebhook(body, signature, requestId)).rejects.toThrow(ForbiddenException)
    })
  })
})
