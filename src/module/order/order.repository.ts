import { LoggerService } from '@common/logger/logger.service'
import { PrismaService } from '@db/prisma.service'
import { Inject, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

@Injectable()
export class OrderRepository {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(LoggerService) private readonly logger: LoggerService
  ) {}

  async createOrder(userId: number, data: {
    totalAmount: number
    paymentMethod: string
    transactionId?: string
    statusId: number
  }) {
    return await this.prismaService.order.create({
      data: {
        userId,
        orderStatusId: data.statusId,
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId
      }
    })
  }

  async createOrderItem(orderId: number, itemTypeId: number, itemId: number, quantity: number, unitPrice: number) {
    return await this.prismaService.orderItem.create({
      data: {
        orderId,
        itemTypeId,
        itemId,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity
      }
    })
  }

  async getOrderStatusByCode(code: string) {
    return await this.prismaService.orderStatus.findUnique({
      where: { code }
    })
  }

  async getOrderItemTypeByCode(code: string) {
    return await this.prismaService.orderItemType.findUnique({
      where: { code }
    })
  }

  async updateOrderStatus(orderId: number, statusId: number, transactionId?: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prismaService
    return await client.order.update({
      where: { id: orderId },
      data: {
        orderStatusId: statusId,
        transactionId
      }
    })
  }

  async getOrderByIdWithItems(id: number, tx?: Prisma.TransactionClient) {
    const client = tx || this.prismaService
    return await client.order.findUnique({
      where: { id },
      include: {
        orderStatus: true,
        items: {
          include: {
            itemType: true
          }
        }
      }
    })
  }
}
