import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { EventRepository } from './event.repository'
import { CreateEventDto } from './dto/createEvent.dto'
import { CommunityService } from '../community/community.service'
import { AddressService } from '../address/address.service'
import { UpdateEventDto } from './dto/updateEvent.dto'
import { ModalityEvent } from './dto/event.dto'

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly communityService: CommunityService,
    private readonly addressService: AddressService
  ) {}

  async create(idCommunity: number, data: CreateEventDto) {
    try {
      console.log('EventService.create - Received data:', JSON.stringify(data, null, 2))

      await this.communityService.isExistCommunity(idCommunity)

      const startDate = new Date(data.start_date_time)
      const endDate = new Date(data.end_date_time)

      if (startDate >= endDate) {
        throw new BadRequestException('Data de início deve ser anterior à data de fim')
      }

      if (startDate < new Date()) {
        throw new BadRequestException('Data de início não pode ser no passado')
      }

      let addressId: number | undefined = undefined

      if (data.modality !== 'ONLINE' && data.address) {
        console.log('Creating address:', data.address)
        const createdAddress = await this.addressService.create(data.address)
        addressId = createdAddress.id
        console.log('Address created with ID:', addressId)
      }

      // Validar se evento não-online tem endereço
      if (data.modality !== 'ONLINE' && !addressId) {
        throw new BadRequestException('Eventos presenciais e híbridos devem ter endereço')
      }

      // Criar o evento com os dados corretos
      const eventData = {
        title: data.title,
        description: data.description,
        start_date_time: startDate,
        end_date_time: endDate,
        modality: data.modality,
        link: data.link ?? '',
        capa_url: data.capa_url ?? '',
        is_active: data.is_active ?? true,
        id_address: addressId
      }

      console.log('Creating event with data:', eventData)
      const createdEvent = await this.eventRepository.create(eventData, idCommunity)
      console.log('Event created successfully:', createdEvent)

      return createdEvent
    } catch (error) {
      console.error('Error creating event:', error)

      // Se é um erro conhecido
      if (error.name === 'NotFoundException' || error.name === 'BadRequestException') {
        throw error
      }

      // Erro genérico
      throw new BadRequestException('Erro interno ao criar evento')
    }
  }

  async getById(id: number) {
    await this.verifyEventIsExist(id)
    return await this.eventRepository.getByID(id)
  }

  private async verifyEventIsExist(id: number) {
    if (!(await this.eventRepository.getByID(id))) throw new NotFoundException('Evento não encontrado!')
  }

  async getAll(take: number, skip: number) {
    return await this.eventRepository.getAll(take, skip)
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
      capa_url: data.event.capa_url ?? '',
      title: data.event.title ?? '',
      description: data.event.description ?? '',
      start_date_time: data.event.start_date_time ? new Date(data.event.start_date_time) : new Date(),
      end_date_time: data.event.end_date_time ? new Date(data.event.end_date_time) : new Date(),
      modality: data.event.modality ?? ModalityEvent.ONLINE,
      is_active: data.event.is_active ?? true
    }
    return await this.eventRepository.update(idEvent, eventToUpdate)
  }

  async delete(idEvent: number) {
    await this.verifyEventIsExist(idEvent)
    await this.eventRepository.delete(idEvent)
  }
}
