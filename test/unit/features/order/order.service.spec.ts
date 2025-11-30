import { createHmac } from 'node:crypto'
import { LoggerService } from '@common/logger/logger.service'
import { PrismaService } from '@db/prisma.service'
import { EmailService } from '@infrastructure/email/email.service'
import { CreateOrderDto } from '@module/order/dto/create-order.dto'
import { OrderRepository } from '@module/order/order.repository'
import { OrderService } from '@module/order/order.service'
import { TicketService } from '@module/ticket/ticket.service'
import { BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Order, OrderItemType, OrderStatus, TicketType } from '@prisma/client'

jest.mock('mercadopago', () => {
  return {
    __esModule: true,
    MercadoPagoConfig: jest.fn(),
    Payment: jest.fn().mockImplementation(() => ({
      create: jest.fn(),
      get: jest.fn()
    })),
    Preference: jest.fn().mockImplementation(() => ({
      create: jest.fn()
    }))
  }
})

describe('OrderService', () => {
  let service: OrderService
  let orderRepository: OrderRepository
  let ticketService: TicketService
  let configService: ConfigService
  let paymentMock: any
  let preferenceMock: any

  const mockEmailService = {
    sendTicketEmail: jest.fn()
  }

  const mockOrderRepository = {
    getOrderStatusByCode: jest.fn(),
    getOrderItemTypeByCode: jest.fn(),
    createOrder: jest.fn(),
    createOrderItem: jest.fn(),
    updateOrderStatus: jest.fn(),
    getOrderByIdWithItems: jest.fn()
  }

  const mockTicketService = {
    getTicketTypeById: jest.fn(),
    decrementStock: jest.fn(),
    createTicket: jest.fn()
  }

  const mockLoggerService = {
    log: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
  }

  const mockPrismaService = {
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
    ticket: {
      findUnique: jest.fn()
    }
  }

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-token')
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: OrderRepository, useValue: mockOrderRepository },
        { provide: TicketService, useValue: mockTicketService },
        { provide: LoggerService, useValue: mockLoggerService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: ConfigService, useValue: mockConfigService }
      ]
    }).compile()

    service = module.get<OrderService>(OrderService)
    orderRepository = module.get<OrderRepository>(OrderRepository)
    ticketService = module.get<TicketService>(TicketService)
    configService = module.get<ConfigService>(ConfigService)

    // Access the mocked Payment instance
    paymentMock = (service as any).paymentClient
    preferenceMock = (service as any).preferenceClient
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(orderRepository).toBeDefined()
    expect(ticketService).toBeDefined()
  })

  describe('createOrder', () => {
    const userId = 1
    const createOrderDto: CreateOrderDto = {
      ticketTypeId: 1,
      quantity: 2,
      paymentMethodId: 'pix',
      token: 'test-token',
      payerEmail: 'test@test.com',
      installments: 1,
      issuerId: '123',
      payerFirstName: 'Test',
      payerLastName: 'User',
      payerIdentification: {
        type: 'CPF',
        number: '12345678909'
      }
    }

    const mockTicketType = {
      id: 1,
      name: 'Test Ticket',
      price: 50,
      quantity: 100,
      eventId: 1
    } as unknown as TicketType

    const mockPendingStatus = { id: 1, code: 'PENDING' } as unknown as OrderStatus
    const mockTicketItemType = { id: 1, code: 'TICKET' } as unknown as OrderItemType
    const mockOrder = { id: 1, totalAmount: 100 } as unknown as Order

    it('should create an order successfully', async () => {
      mockTicketService.getTicketTypeById.mockResolvedValue(mockTicketType)
      mockOrderRepository.getOrderStatusByCode.mockResolvedValue(mockPendingStatus)
      mockOrderRepository.getOrderItemTypeByCode.mockResolvedValue(mockTicketItemType)
      mockOrderRepository.createOrder.mockResolvedValue(mockOrder)

      preferenceMock.create.mockResolvedValue({
        id: 'pref-123',
        init_point: 'https://mercadopago.com/init',
        sandbox_init_point: 'https://sandbox.mercadopago.com/init'
      })

      const result = await service.createOrder(userId, createOrderDto)

      expect(result).toHaveProperty('orderId', 1)
      expect(result).toHaveProperty('transactionId', 'pref-123')
      expect(mockOrderRepository.createOrder).toHaveBeenCalled()
      expect(mockOrderRepository.createOrderItem).toHaveBeenCalled()
      expect(preferenceMock.create).toHaveBeenCalled()
    })

    it('should throw BadRequestException if quantity is unavailable', async () => {
      mockTicketService.getTicketTypeById.mockResolvedValue({ ...mockTicketType, quantity: 1 })

      await expect(service.createOrder(userId, createOrderDto)).rejects.toThrow(BadRequestException)
    })

    it('should throw InternalServerErrorException if configuration is missing', async () => {
      mockTicketService.getTicketTypeById.mockResolvedValue(mockTicketType)
      mockOrderRepository.getOrderStatusByCode.mockResolvedValue(null)

      await expect(service.createOrder(userId, createOrderDto)).rejects.toThrow(InternalServerErrorException)
    })

    it('should handle payment failure and cancel order', async () => {
      mockTicketService.getTicketTypeById.mockResolvedValue(mockTicketType)
      mockOrderRepository.getOrderStatusByCode.mockImplementation(async (code) => {
        if (code === 'PENDING') {
          return await Promise.resolve(mockPendingStatus)
        }
        if (code === 'CANCELLED') {
          return await Promise.resolve({ id: 3, code: 'CANCELLED' })
        }
        return await Promise.resolve(null)
      })
      mockOrderRepository.getOrderItemTypeByCode.mockResolvedValue(mockTicketItemType)
      mockOrderRepository.createOrder.mockResolvedValue(mockOrder)

      preferenceMock.create.mockRejectedValue(new Error('Payment failed'))

      await expect(service.createOrder(userId, createOrderDto)).rejects.toThrow(BadRequestException)

      expect(mockOrderRepository.updateOrderStatus).toHaveBeenCalledWith(mockOrder.id, 3)
    })
  })

  describe('handlePaymentWebhook', () => {
    const paymentId = '12345'
    const mockPaymentResponse = {
      id: 12345,
      status: 'approved',
      status_detail: 'accredited',
      metadata: {
        order_id: '1',
        user_id: 1
      }
    }

    const mockOrder = {
      id: 1,
      userId: 1,
      orderStatus: { id: 1, code: 'PENDING' },
      items: [
        {
          itemId: 1,
          quantity: 2,
          itemType: { code: 'TICKET' }
        }
      ]
    }

    it('should process approved payment', async () => {
      paymentMock.get.mockResolvedValue(mockPaymentResponse)
      mockOrderRepository.getOrderByIdWithItems.mockResolvedValue(mockOrder)
      mockOrderRepository.getOrderStatusByCode.mockResolvedValue({ id: 2, code: 'CONFIRMED' })
      mockTicketService.getTicketTypeById.mockResolvedValue({ id: 1, eventId: 1 })

      await service.handlePaymentWebhook(paymentId)

      expect(mockOrderRepository.updateOrderStatus).toHaveBeenCalledWith(1, 2, '12345', expect.anything())
      expect(mockTicketService.createTicket).toHaveBeenCalledTimes(2)
    })

    it('should process rejected payment', async () => {
      paymentMock.get.mockResolvedValue({ ...mockPaymentResponse, status: 'rejected' })
      mockOrderRepository.getOrderByIdWithItems.mockResolvedValue(mockOrder)
      mockOrderRepository.getOrderStatusByCode.mockResolvedValue({ id: 3, code: 'CANCELLED' })

      await service.handlePaymentWebhook(paymentId)

      expect(mockOrderRepository.updateOrderStatus).toHaveBeenCalledWith(1, 3, '12345')
    })

    it('should handle errors in webhook processing', async () => {
      const paymentId = '123'

      paymentMock.get.mockResolvedValue({
        id: 123,
        status: 'approved',
        external_reference: '1',
        metadata: { order_id: '1' }
      })

      mockOrderRepository.getOrderByIdWithItems.mockRejectedValue(new Error('DB Error'))

      await service.handlePaymentWebhook(paymentId)

      expect(mockLoggerService.error).toHaveBeenCalledWith('Error handling payment webhook', 'DB Error')
    })

    it('should handle non-Error objects in webhook processing', async () => {
      const paymentId = '123'

      paymentMock.get.mockResolvedValue({
        id: 123,
        status: 'approved',
        external_reference: '1',
        metadata: { order_id: '1' }
      })

      mockOrderRepository.getOrderByIdWithItems.mockRejectedValue('String Error')

      await service.handlePaymentWebhook(paymentId)

      expect(mockLoggerService.error).toHaveBeenCalledWith('Error handling payment webhook', 'String Error')
    })

    it('should not send email if order not found in sendTicketsEmail', async () => {
      const paymentId = '123'

      paymentMock.get.mockResolvedValue({
        id: 123,
        status: 'approved',
        external_reference: '1',
        metadata: { order_id: '1' }
      })

      const order = { id: 1, orderStatus: 'PENDING', items: [], userId: 'user-1' }
      const approvedStatus = { id: 2, code: 'CONFIRMED' }

      mockOrderRepository.getOrderStatusByCode.mockResolvedValue(approvedStatus)

      const orderWithItems = {
        ...order,
        items: [{ itemType: { code: 'TICKET' }, itemId: 1, quantity: 1, unitPrice: 10 }]
      }

      mockOrderRepository.getOrderByIdWithItems
        .mockResolvedValueOnce(orderWithItems) // handlePaymentWebhook
        .mockResolvedValueOnce(orderWithItems) // processApprovedOrder
        .mockResolvedValueOnce(null) // sendTicketsEmail

      mockTicketService.getTicketTypeById.mockResolvedValue({ id: 1, eventId: 1 })
      mockTicketService.createTicket.mockResolvedValue({ id: 1 })

      await service.handlePaymentWebhook(paymentId)

      expect(mockEmailService.sendTicketEmail).not.toHaveBeenCalled()
    })
  })

  describe('validateWebhookSignature', () => {
    it('should return true for a valid signature', () => {
      const secret = 'test-secret'
      const id = '12345'
      const requestId = 'req-123'
      const ts = '1234567890'

      jest.spyOn(configService, 'get').mockReturnValue(secret)

      const manifest = `id:${id};request-id:${requestId};ts:${ts};`
      const hmac = createHmac('sha256', secret)
      hmac.update(manifest)
      const v1 = hmac.digest('hex')

      const signature = `ts=${ts},v1=${v1}`

      expect(service.validateWebhookSignature(id, requestId, signature)).toBe(true)
    })

    it('should return false for an invalid signature', () => {
      const secret = 'test-secret'
      jest.spyOn(configService, 'get').mockReturnValue(secret)

      const id = '12345'
      const requestId = 'req-123'
      const signature = 'ts=1234567890,v1=invalid_hash'

      expect(service.validateWebhookSignature(id, requestId, signature)).toBe(false)
    })

    it('should return false if secret is not configured', () => {
      jest.spyOn(configService, 'get').mockReturnValue(null)

      const id = '12345'
      const requestId = 'req-123'
      const signature = 'ts=1234567890,v1=somehash'

      expect(service.validateWebhookSignature(id, requestId, signature)).toBe(false)
    })

    it('should return false if signature format is invalid', () => {
      const secret = 'test-secret'
      jest.spyOn(configService, 'get').mockReturnValue(secret)

      expect(service.validateWebhookSignature('id', 'req', 'invalid')).toBe(false)
    })

    it('should ignore malformed parts in signature', () => {
      const secret = 'test-secret'
      jest.spyOn(configService, 'get').mockReturnValue(secret)
      const id = '12345'
      const requestId = 'req-123'
      const ts = '1234567890'

      const manifest = `id:${id};request-id:${requestId};ts:${ts};`
      const hmac = createHmac('sha256', secret)
      hmac.update(manifest)
      const v1 = hmac.digest('hex')

      const signature = `ts=${ts},malformed,,v1=${v1}`

      expect(service.validateWebhookSignature(id, requestId, signature)).toBe(true)
    })
  })

  describe('Constructor', () => {
    it('should warn if MERCADO_PAGO_ACCESS_TOKEN is missing', async () => {
      const mockLogger = { warn: jest.fn(), log: jest.fn() }
      const mockConfig = { get: jest.fn().mockReturnValue(undefined) }

      await Test.createTestingModule({
        providers: [
          OrderService,
          { provide: OrderRepository, useValue: mockOrderRepository },
          { provide: TicketService, useValue: mockTicketService },
          { provide: LoggerService, useValue: mockLogger },
          { provide: PrismaService, useValue: mockPrismaService },
          { provide: EmailService, useValue: mockEmailService },
          { provide: ConfigService, useValue: mockConfig }
        ]
      }).compile()

      expect(mockLogger.warn).toHaveBeenCalledWith('MERCADO_PAGO_ACCESS_TOKEN not found in env')
    })
  })

  describe('sendTicketsEmail', () => {
    it('should send email when order is approved', async () => {
      const orderId = 1
      const mockOrder = {
        id: orderId,
        userId: 1,
        orderStatus: { id: 1, code: 'PENDING' },
        items: [{ itemId: 1, quantity: 1, unitPrice: 100, itemType: { code: 'TICKET' } }],
        user: { email: 'test@example.com' }
      }

      mockOrderRepository.getOrderStatusByCode.mockResolvedValue({ id: 2, code: 'CONFIRMED' })
      mockOrderRepository.getOrderByIdWithItems.mockResolvedValue(mockOrder)
      mockTicketService.getTicketTypeById.mockResolvedValue({ id: 1, eventId: 1, price: 100 })
      mockTicketService.createTicket.mockResolvedValue({ id: 'ticket-1' })

      mockPrismaService.ticket.findUnique.mockResolvedValue({
        id: 'ticket-1',
        event: { title: 'Event' },
        ticketType: { name: 'Type' },
        user: { email: 'test@example.com' }
      })

      paymentMock.get.mockResolvedValue({
        id: 12345,
        status: 'approved',
        metadata: { order_id: String(orderId) }
      })

      await service.handlePaymentWebhook('12345')

      // Wait for async void function
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })

      expect(mockEmailService.sendTicketEmail).toHaveBeenCalled()
    })
  })

  describe('Additional Coverage', () => {
    it('should throw InternalServerErrorException if status or item type not found in createOrder', async () => {
      const dto = { ticketTypeId: 1, quantity: 1, paymentMethodId: 'pix' } as CreateOrderDto
      mockTicketService.getTicketTypeById.mockResolvedValue({ id: 1, quantity: 10, price: 100 })
      mockOrderRepository.getOrderStatusByCode.mockResolvedValue(null)

      await expect(service.createOrder(1, dto)).rejects.toThrow(InternalServerErrorException)
    })

    it('should log warning if orderId not found in metadata in handlePaymentWebhook', async () => {
      paymentMock.get.mockResolvedValue({ status: 'approved', metadata: {} })
      const loggerSpy = jest.spyOn((service as any).logger, 'warn')

      await service.handlePaymentWebhook('123')

      expect(loggerSpy).toHaveBeenCalledWith('Order ID not found in payment metadata', { paymentId: '123' })
    })

    it('should log error if payment not found in webhook', async () => {
      paymentMock.get.mockRejectedValue(new Error('Not found'))
      const loggerSpy = jest.spyOn((service as any).logger, 'error')

      await service.handlePaymentWebhook('123')

      expect(loggerSpy).toHaveBeenCalledWith('Error handling payment webhook', 'Not found')
    })
  })
})
