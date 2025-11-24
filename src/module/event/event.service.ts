import { buildPaginatedResponse } from '@common/dto/pagination.dto'
import { LoggerService } from '@common/logger/logger.service'
import { AddressService } from '@module/address/address.service'
import { CommunityService } from '@module/community/community.service'
import { CreateEventDto } from '@module/event/dto/createEvent.dto'
import { ModalityEvent } from '@module/event/dto/event.dto'
import { UpdateEventDto } from '@module/event/dto/updateEvent.dto'
import { EventRepository } from '@module/event/event.repository'
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'

@Injectable()
export class EventService {
  constructor(
    @Inject(EventRepository)
    private readonly eventRepository: EventRepository,
    @Inject(CommunityService)
    private readonly communityService: CommunityService,
    @Inject(AddressService)
    private readonly addressService: AddressService,
    @Inject(LoggerService)
    private readonly logger: LoggerService
  ) {}

  async create(idCommunity: number, data: CreateEventDto) {
    try {
      this.logger.debug('Creating event', { idCommunity, title: data.title })

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
        this.logger.debug('Creating address for event')
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

      const createdEvent = await this.eventRepository.create(eventData, idCommunity)
      this.logger.log('Event created successfully', { eventId: createdEvent.id, idCommunity })

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
    return await this.eventRepository.getByID(id)
  }

  private async verifyEventIsExist(id: number) {
    const event = await this.eventRepository.getByID(id)
    if (!event) {
      throw new NotFoundException('Evento não encontrado!')
    }
  }

  async getAll(take: number, skip: number, options?: { communityId?: number, modality?: string, isActive?: boolean, baseUrl?: string }) {
    const { data, total } = await this.eventRepository.getAll(take, skip, {
      communityId: options?.communityId,
      modality: options?.modality,
      isActive: options?.isActive
    })

    return buildPaginatedResponse(data, total, {
      take,
      skip,
      baseUrl: options?.baseUrl || '/events',
      queryParams: {
        communityId: options?.communityId,
        modality: options?.modality,
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
    return await this.eventRepository.update(idEvent, eventToUpdate)
  }

  async delete(idEvent: number) {
    await this.verifyEventIsExist(idEvent)
    await this.eventRepository.delete(idEvent)
  }
}
