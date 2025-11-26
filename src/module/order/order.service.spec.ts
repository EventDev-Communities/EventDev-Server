import { createHmac } from 'node:crypto'
import { LoggerService } from '@common/logger/logger.service'
import { PrismaService } from '@db/prisma.service'
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
    default: jest.fn(),
    Payment: jest.fn().mockImplementation(() => ({
      create: jest.fn(),
      get: jest.fn()
    }))
  }
})

describe('OrderService', () => {
  let service: OrderService
  let orderRepository: OrderRepository
  let ticketService: TicketService
  let configService: ConfigService
  let paymentMock: any

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
    $transaction: jest.fn((cb) => cb(mockPrismaService))
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
        { provide: ConfigService, useValue: mockConfigService }
      ]
    }).compile()

    service = module.get<OrderService>(OrderService)
    orderRepository = module.get<OrderRepository>(OrderRepository)
    ticketService = module.get<TicketService>(TicketService)
    configService = module.get<ConfigService>(ConfigService)

    // Access the mocked Payment instance
    paymentMock = (service as any).payment
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
      issuerId: '123'
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

      paymentMock.create.mockResolvedValue({
        id: 12345,
        status: 'pending',
        status_detail: 'pending_waiting_payment',
        point_of_interaction: {
          transaction_data: {
            qr_code: 'qr-code',
            qr_code_base64: 'base64',
            ticket_url: 'url'
          }
        }
      })

      const result = await service.createOrder(userId, createOrderDto)

      expect(result).toHaveProperty('orderId', 1)
      expect(result).toHaveProperty('transactionId', 12345)
      expect(mockOrderRepository.createOrder).toHaveBeenCalled()
      expect(mockOrderRepository.createOrderItem).toHaveBeenCalled()
      expect(paymentMock.create).toHaveBeenCalled()
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
          unitPrice: 50,
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
  })
})
