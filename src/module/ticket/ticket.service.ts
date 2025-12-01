import { buildPaginatedResponse } from '@common/dto/pagination.dto'
import { LoggerService } from '@common/logger/logger.service'
import { PrismaService } from '@db/prisma.service'
import { CreateTicketTypeDto } from '@module/ticket/dto/create-ticket-type.dto'
import { UpdateTicketTypeDto } from '@module/ticket/dto/update-ticket-type.dto'
import { TicketRepository } from '@module/ticket/ticket.repository'
import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { Prisma, Ticket, TicketType } from '@prisma/client'

@Injectable()
export class TicketService {
  constructor(
    @Inject(TicketRepository) private readonly ticketRepository: TicketRepository,
    @Inject(LoggerService) private readonly logger: LoggerService,
    @Inject(PrismaService) private readonly prismaService: PrismaService
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

  async getTicketById(id: number) {
    const ticket = await this.ticketRepository.getTicketById(id)
    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado')
    }
    return ticket
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

  async checkIn(ticketId: number, userId: string) {
    const ticket = await this.ticketRepository.getTicketById(ticketId)
    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado')
    }

    // Verify ownership/permission
    // Logic: The user performing the check-in must be the owner of the community that created the event
    // This logic might be better placed in a Guard or Controller, but we can do a basic check here if we have access to CommunityService
    // For now, we will assume the Controller has validated that the user has permission to manage this event.

    if (ticket.status.code === 'USED') {
      throw new BadRequestException('Ticket já utilizado')
    }

    if (ticket.status.code !== 'CONFIRMED') {
      throw new BadRequestException(`Ticket inválido para check-in (Status: ${ticket.status.name})`)
    }

    const usedStatus = await this.ticketRepository.getTicketStatusByCode('USED')
    if (!usedStatus) {
      throw new InternalServerErrorException('Status USED não encontrado no sistema')
    }

    await this.ticketRepository.updateTicketStatus(ticket.id, usedStatus.id)

    this.logger.log(`Check-in realizado com sucesso`, { ticketId, userId })

    return {
      status: 'success',
      message: 'Check-in realizado com sucesso',
      ticket: {
        id: ticket.id,
        event: ticket.event.title,
        participant: ticket.user.email,
        type: ticket.ticketType.name,
        checkedInAt: new Date()
      }
    }
  }

  async getUserTickets(userId: number) {
    const { data } = await this.ticketRepository.getAllTickets(100, 0, { userId })
    return data
  }

  async hasTicketForEvent(userId: number, eventId: number): Promise<boolean> {
    const { total } = await this.ticketRepository.getAllTickets(1, 0, { userId, eventId })
    return total > 0
  }
}
