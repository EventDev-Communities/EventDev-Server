import { LoggerService } from '@common/logger/logger.service'
import { PrismaService } from '@db/prisma.service'
import { OrderRepository } from '@module/order/order.repository'
import { Test, TestingModule } from '@nestjs/testing'

describe('OrderRepository', () => {
  let repository: OrderRepository

  const mockPrismaService = {
    order: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn()
    },
    orderItem: {
      create: jest.fn()
    },
    orderStatus: {
      findUnique: jest.fn()
    },
    orderItemType: {
      findUnique: jest.fn()
    }
  }

  const mockLogger = {
    log: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderRepository,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: LoggerService, useValue: mockLogger }
      ]
    }).compile()

    repository = module.get<OrderRepository>(OrderRepository)
  })

  it('should be defined', () => {
    expect(repository).toBeDefined()
  })

  describe('createOrder', () => {
    it('should create an order', async () => {
      const data = {
        totalAmount: 100,
        paymentMethod: 'credit_card',
        statusId: 1,
        transactionId: 'tx-123'
      }
      const result = { id: 1, ...data, userId: 1 }
      mockPrismaService.order.create.mockResolvedValue(result)

      expect(await repository.createOrder(1, data)).toEqual(result)
      expect(mockPrismaService.order.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          orderStatusId: data.statusId,
          totalAmount: data.totalAmount,
          paymentMethod: data.paymentMethod,
          transactionId: data.transactionId
        }
      })
    })
  })

  describe('createOrderItem', () => {
    it('should create an order item', async () => {
      const result = { id: 1 }
      mockPrismaService.orderItem.create.mockResolvedValue(result)

      expect(await repository.createOrderItem(1, 1, 1, 2, 50)).toEqual(result)
      expect(mockPrismaService.orderItem.create).toHaveBeenCalledWith({
        data: {
          orderId: 1,
          itemTypeId: 1,
          itemId: 1,
          quantity: 2,
          unitPrice: 50,
          totalPrice: 100
        }
      })
    })
  })

  describe('getOrderStatusByCode', () => {
    it('should return order status by code', async () => {
      const result = { id: 1, code: 'PENDING' }
      mockPrismaService.orderStatus.findUnique.mockResolvedValue(result)

      expect(await repository.getOrderStatusByCode('PENDING')).toEqual(result)
      expect(mockPrismaService.orderStatus.findUnique).toHaveBeenCalledWith({
        where: { code: 'PENDING' }
      })
    })
  })

  describe('getOrderItemTypeByCode', () => {
    it('should return order item type by code', async () => {
      const result = { id: 1, code: 'TICKET' }
      mockPrismaService.orderItemType.findUnique.mockResolvedValue(result)

      expect(await repository.getOrderItemTypeByCode('TICKET')).toEqual(result)
      expect(mockPrismaService.orderItemType.findUnique).toHaveBeenCalledWith({
        where: { code: 'TICKET' }
      })
    })
  })

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const result = { id: 1, orderStatusId: 2 }
      mockPrismaService.order.update.mockResolvedValue(result)

      expect(await repository.updateOrderStatus(1, 2, 'tx-456')).toEqual(result)
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          orderStatusId: 2,
          transactionId: 'tx-456'
        }
      })
    })
  })

  describe('getOrderByIdWithItems', () => {
    it('should return order with items', async () => {
      const result = { id: 1, items: [] }
      mockPrismaService.order.findUnique.mockResolvedValue(result)

      expect(await repository.getOrderByIdWithItems(1)).toEqual(result)
      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } })
      )
    })
  })
})
