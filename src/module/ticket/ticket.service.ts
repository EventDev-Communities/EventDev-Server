import { buildPaginatedResponse } from '@common/dto/pagination.dto'
import { LoggerService } from '@common/logger/logger.service'
import { AddressService } from '@module/address/address.service'
import { CommunityService } from '@module/community/community.service'
import { CreateEventDto } from '@module/ticket/dto/createEvent.dto'
import { ModalityEvent } from '@module/ticket/dto/ticket.dto'
import { UpdateEventDto } from '@module/ticket/dto/updateEvent.dto'
import { TicketRepository } from '@module/ticket/ticket.repository'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly communityService: CommunityService,
    private readonly addressService: AddressService,
    private readonly logger: LoggerService
  ) {}

  async create(idCommunity: number, data: CreateEventDto) {
    try {
      this.logger.debug('Creating ticket', { idCommunity, title: data.title })

      await this.communityService.isExistCommunity(idCommunity)

      const startDate = new Date(data.startDateTime)
      const endDate = new Date(data.endDateTime)

      if (startDate >= endDate) {
        throw new BadRequestException('Data de início deve ser anterior à data de fim')
      }

      if (startDate < new Date()) {
        throw new BadRequestException('Data de início não pode ser no passado')
      }

      let addressId: number | undefined

      if (data.modality !== 'ONLINE' && data.address) {
        this.logger.debug('Creating address for ticket')
        const createdAddress = await this.addressService.create(data.address)
        addressId = createdAddress.id
        this.logger.debug('Address created', { addressId })
      }

      if (data.modality !== 'ONLINE' && !addressId) {
        throw new BadRequestException('Eventos presenciais e híbridos devem ter endereço')
      }

      const eventData = {
        title: data.title,
        description: data.description,
        startDateTime: startDate,
        endDateTime: endDate,
        modality: data.modality,
        link: data.link ?? '',
        coverUrl: data.coverUrl ?? '',
        isActive: data.isActive ?? true,
        addressId
      }

      const createdEvent = await this.ticketRepository.create(eventData, idCommunity)

      this.logger.log('Ticket created successfully', { ticketId: createdEvent.id, idCommunity })

      return createdEvent
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error
      }

      this.logger.error('Erro ao criar evento:', error instanceof Error ? error.stack : String(error))
      throw new BadRequestException('Erro interno ao criar evento')
    }
  }

  async getById(id: number) {
    await this.verifyEventIsExist(id)
    return await this.ticketRepository.getByID(id)
  }

  private async verifyEventIsExist(id: number) {
    const ticket = await this.ticketRepository.getByID(id)
    if (!ticket) {
      throw new NotFoundException('Evento não encontrado!')
    }
  }

  async getAll(take: number, skip: number, options?: { eventId?: number, isActive?: boolean, baseUrl?: string }) {
    const { data, total } = await this.ticketRepository.getAll(take, skip, {
      eventId: options?.eventId,
      isActive: options?.isActive
    })

    return buildPaginatedResponse(data, total, {
      take,
      skip,
      baseUrl: options?.baseUrl || '/tickets',
      queryParams: {
        eventId: options?.eventId,
        isActive: options?.isActive
      }
    })
  }

  async update(idEvent: number, data: UpdateEventDto, idAddress: number) {
    await this.verifyEventIsExist(idEvent)
    if (data.address) {
      await this.addressService.update(data.address, idAddress)
    }
    if (!data.event) {
      throw new BadRequestException('Dados do evento não informados para atualização')
    }
    const eventToUpdate = {
      ...data.event,
      link: data.event.link ?? '',
      coverUrl: data.event.coverUrl ?? '',
      title: data.event.title ?? '',
      description: data.event.description ?? '',
      startDateTime: data.event.startDateTime ? new Date(data.event.startDateTime) : new Date(),
      endDateTime: data.event.endDateTime ? new Date(data.event.endDateTime) : new Date(),
      modality: data.event.modality ?? ModalityEvent.ONLINE,
      isActive: data.event.isActive ?? true
    }
    return await this.ticketRepository.update(idEvent, eventToUpdate)
  }

  async delete(idEvent: number) {
    await this.verifyEventIsExist(idEvent)
    await this.ticketRepository.delete(idEvent)
  }
}
