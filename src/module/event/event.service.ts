import { Injectable, NotFoundException } from '@nestjs/common'
import { EventRepository } from './event.repository'
import { CreateEventDto } from './dto/createEvent.dto'
import { CommunityService } from '../community/community.service'
import { AddressService } from '../address/address.service'
import { UpdateEventDto } from './dto/updateEvent.dto'

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly communityService: CommunityService,
    private readonly addressService: AddressService
  ) {}

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

  async create(idCommunity: number, data: CreateEventDto) {
    await this.communityService.isExistCommunity(idCommunity)

    if (data.address) {
      const address = await this.addressService.create(data.address)
      if (!address.id) throw new Error('Erro ao criar endereço')

      return await this.eventRepository.create(data.event, idCommunity, address.id as number)
    }

    return await this.eventRepository.create(data.event, idCommunity)
  }

  async update(idEvent: number, data: UpdateEventDto, idAddress: number) {
    await this.verifyEventIsExist(idEvent)
    if (data.address) {
      await this.addressService.update(data.address, idAddress)
    }
    return await this.eventRepository.update(idEvent, data.event)
  }

  async delete(idEvent: number) {
    await this.verifyEventIsExist(idEvent)
    await this.eventRepository.delete(idEvent)
  }
}
