import { LoggerService } from '@common/logger/logger.service'
import { PrismaService } from '@db/prisma.service'
import { CreateTicketTypeDto } from '@module/ticket/dto/create-ticket-type.dto'
import { UpdateTicketTypeDto } from '@module/ticket/dto/update-ticket-type.dto'
import { Inject, Injectable } from '@nestjs/common'
import { Prisma, TicketType } from '@prisma/client'

@Injectable()
export class TicketRepository {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(LoggerService) private readonly logger: LoggerService
  ) {
    this.logger.log('[TicketRepository] constructed')
  }

  async createTicketType(data: CreateTicketTypeDto): Promise<TicketType> {
    return await this.prismaService.ticketType.create({
      data: {
        eventId: data.eventId,
        name: data.name,
        description: data.description,
        price: data.price,
        quantity: data.quantity,
        isActive: data.isActive ?? true
      }
    })
  }

  async getTicketTypeById(id: number): Promise<TicketType | null> {
    return await this.prismaService.ticketType.findUnique({
      where: { id },
      include: {
        event: true
      }
    })
  }

  async getTicketTypesByEvent(eventId: number) {
    return await this.prismaService.ticketType.findMany({
      where: { eventId },
      orderBy: { price: 'asc' }
    })
  }

  async updateTicketType(id: number, data: UpdateTicketTypeDto) {
    return await this.prismaService.ticketType.update({
      where: { id },
      data
    })
  }

  async deleteTicketType(id: number) {
    return await this.prismaService.ticketType.delete({
      where: { id }
    })
  }

  async createTicket(data: {
    eventId: number
    userId: number
    ticketTypeId: number
    ticketStatusId: number
    value: number
    purchasedAt: Date
  }, tx?: Prisma.TransactionClient) {
    const client = tx || this.prismaService
    return await client.ticket.create({
      data: {
        eventId: data.eventId,
        userId: data.userId,
        ticketTypeId: data.ticketTypeId,
        ticketStatusId: data.ticketStatusId,
        value: data.value,
        purchasedAt: data.purchasedAt
      }
    })
  }

  async decrementTicketTypeQuantity(id: number, quantity: number, tx?: Prisma.TransactionClient) {
    const client = tx || this.prismaService
    return await client.ticketType.update({
      where: { id },
      data: {
        quantity: {
          decrement: quantity
        }
      }
    })
  }

  async getTicketStatusByCode(code: string) {
    return await this.prismaService.ticketStatus.findUnique({
      where: { code }
    })
  }

  // Methods for purchased tickets (if needed later)
  async getAllTickets(take: number, skip: number, filters?: { eventId?: number, userId?: number }) {
    const where: Prisma.TicketWhereInput = {}

    if (filters?.eventId) {
      where.eventId = filters.eventId
    }
    if (filters?.userId) {
      where.userId = filters.userId
    }

    const [data, total] = await Promise.all([
      this.prismaService.ticket.findMany({
        take,
        skip,
        where,
        include: {
          event: true,
          ticketType: true,
          status: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prismaService.ticket.count({ where })
    ])

    return { data, total }
  }

  async getTicketById(id: number) {
    return await this.prismaService.ticket.findUnique({
      where: { id },
      include: {
        event: true,
        status: true,
        ticketType: true,
        user: true
      }
    })
  }

  async updateTicketStatus(id: number, statusId: number) {
    return await this.prismaService.ticket.update({
      where: { id },
      data: {
        ticketStatusId: statusId
      }
    })
  }
}
