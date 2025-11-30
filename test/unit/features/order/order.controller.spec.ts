import { LoggerService } from '@common/logger/logger.service'
import { PrismaService } from '@db/prisma.service'
import { CreateOrderDto } from '@module/order/dto/create-order.dto'
import { OrderController } from '@module/order/order.controller'
import { OrderService } from '@module/order/order.service'
import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

describe('OrderController', () => {
  let controller: OrderController
  // let service: OrderService
  // let prisma: PrismaService

  const mockOrderService = {
    createOrder: jest.fn()
  }

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn()
  }

  const mockPrismaService = {
    user: {
      findUnique: jest.fn()
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService
        },
        {
          provide: LoggerService,
          useValue: mockLogger
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile()

    controller = module.get<OrderController>(OrderController)
    // service = module.get<OrderService>(OrderService)
    // prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('createOrder', () => {
    it('should create an order', async () => {
      const dto: CreateOrderDto = {
        ticketTypeId: 1,
        quantity: 1,
        paymentMethodId: 'pix',
        payerEmail: 'test@test.com',
        payerFirstName: 'Test',
        payerLastName: 'User',
        payerIdentification: { type: 'CPF', number: '12345678900' }
      }
      const user = { id: 'supertokens-id' }
      const dbUser = { id: 1 }
      const result = { id: 1 }

      mockPrismaService.user.findUnique.mockResolvedValue(dbUser)
      mockOrderService.createOrder.mockResolvedValue(result)

      expect(await controller.createOrder(dto, user as any)).toBe(result)
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { supertokensId: user.id } })
      expect(mockOrderService.createOrder).toHaveBeenCalledWith(dbUser.id, dto)
    })

    it('should throw NotFoundException if user not found', async () => {
      const dto: CreateOrderDto = {
        ticketTypeId: 1,
        quantity: 1,
        paymentMethodId: 'pix',
        payerEmail: 'test@test.com',
        payerFirstName: 'Test',
        payerLastName: 'User',
        payerIdentification: { type: 'CPF', number: '12345678900' }
      }
      const user = { id: 'supertokens-id' }

      mockPrismaService.user.findUnique.mockResolvedValue(null)

      await expect(controller.createOrder(dto, user as any)).rejects.toThrow(NotFoundException)
    })
  })
})
