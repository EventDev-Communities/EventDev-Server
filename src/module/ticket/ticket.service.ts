import { buildPaginatedResponse } from '@common/dto/pagination.dto'
import { LoggerService } from '@common/logger/logger.service'
import { CreateTicketTypeDto } from '@module/ticket/dto/create-ticket-type.dto'
import { UpdateTicketTypeDto } from '@module/ticket/dto/update-ticket-type.dto'
import { TicketRepository } from '@module/ticket/ticket.repository'
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, Ticket, TicketType } from '@prisma/client'

@Injectable()
export class TicketService {
  constructor(
    @Inject(TicketRepository) private readonly ticketRepository: TicketRepository,
    @Inject(LoggerService) private readonly logger: LoggerService
  ) {
    this.logger.log('[TicketService] constructed')
  }

  async createTicketType(data: CreateTicketTypeDto) {
    try {
      this.logger.debug('Creating ticket type', { eventId: data.eventId, name: data.name })
      const ticketType = await this.ticketRepository.createTicketType(data)
      this.logger.log('Ticket type created successfully', { ticketTypeId: ticketType.id })
      return ticketType
    } catch (error) {
      this.logger.error('Error creating ticket type:', error instanceof Error ? error.stack : String(error))
      throw new BadRequestException('Erro ao criar tipo de ticket')
    }
  }

  async getTicketTypeById(id: number): Promise<TicketType> {
    const ticketType = await this.ticketRepository.getTicketTypeById(id)
    if (!ticketType) {
      throw new NotFoundException('Tipo de ticket não encontrado')
    }
    return ticketType
  }

  async getTicketTypesByEvent(eventId: number) {
    return await this.ticketRepository.getTicketTypesByEvent(eventId)
  }

  async updateTicketType(id: number, data: UpdateTicketTypeDto) {
    await this.getTicketTypeById(id)
    return await this.ticketRepository.updateTicketType(id, data)
  }

  async deleteTicketType(id: number) {
    await this.getTicketTypeById(id)
    await this.ticketRepository.deleteTicketType(id)
  }

  async createTicket(data: {
    eventId: number
    userId: number
    ticketTypeId: number
    value: number
  }, tx?: Prisma.TransactionClient): Promise<Ticket> {
    const status = await this.ticketRepository.getTicketStatusByCode('CONFIRMED')
    if (!status) {
      throw new Error('Ticket Status CONFIRMED not found')
    }

    return await this.ticketRepository.createTicket({
      ...data,
      ticketStatusId: status.id,
      purchasedAt: new Date()
    }, tx)
  }

  async decrementStock(ticketTypeId: number, quantity: number, tx?: Prisma.TransactionClient): Promise<TicketType> {
    return await this.ticketRepository.decrementTicketTypeQuantity(ticketTypeId, quantity, tx)
  }

  // Legacy/Purchased Tickets methods
  async getAllTickets(take: number, skip: number, options?: { eventId?: number, userId?: number, baseUrl?: string }) {
    const { data, total } = await this.ticketRepository.getAllTickets(take, skip, {
      eventId: options?.eventId,
      userId: options?.userId
    })

    return buildPaginatedResponse(data, total, {
      take,
      skip,
      baseUrl: options?.baseUrl || '/tickets',
      queryParams: {
        eventId: options?.eventId,
        userId: options?.userId
      }
    })
  }
}
