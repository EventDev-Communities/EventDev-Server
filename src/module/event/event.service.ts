import { Injectable, NotFoundException } from "@nestjs/common";
import { EventRepository } from "./event.repository";
import { CreateEventDto } from "./dto/createEvent.dto";
import { CommunityService } from "../community/community.service";
import { AddressService } from "../address/address.service";
import { UpdateEventDto } from "./dto/updateEvent.dto";

@Injectable()
export class EventService {
    constructor(private readonly eventRepository: EventRepository, private readonly communityService: CommunityService, private readonly addressService: AddressService) {}

    async getById(id: number) {
        await this.verifyEventIsExist(id);
        return await this.eventRepository.getByID(id);
    }

    private async verifyEventIsExist(id: number) {
        if(!await this.eventRepository.getByID(id)) throw new NotFoundException('Evento não encontrado!');
    }

    async getAll(take: number, skip: number) {
        return await this.eventRepository.getAll(take, skip);
    }


    async create(idCommunity: number, data: CreateEventDto) {
        await this.communityService.isExistCommunity(idCommunity);

        const address = await this.addressService.create(data.address);
        
        await this.eventRepository.create(data.event, idCommunity, address.id);

    }

    async update(idEvent: number, event: UpdateEventDto) {
        await this.verifyEventIsExist(idEvent);
        return await this.eventRepository.update(idEvent, event);
    }

    async delete(idEvent: number) {
        await this.verifyEventIsExist(idEvent);
        await this.eventRepository.delete(idEvent);
    }
}