import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { EventDto } from "./dto/event.dto";
import { UpdateEventDto } from "./dto/updateEvent.dto";

@Injectable()
export class EventRepository {
    constructor(private readonly prismaService: PrismaService) {}

    async create(data: EventDto, idCommunity, idAddress) {
        await this.prismaService.event.create({data: {
            ...data,
            id_address: idAddress,
            id_community: idCommunity
        }})
    }

    async getByID(id: number) {
        return await this.prismaService.event.findUnique({where: {id}});
    }

    async getAll(take: number, skip: number) {
        return await this.prismaService.event.findMany({
            take,
            skip
        });
    }

    async update(idEvent: number, data: UpdateEventDto) {
        return await this.prismaService.event.update({
            where: {
                id: idEvent
            },
            data: data
        })
    }

    async delete(idEvent: number) {
        await this.prismaService.event.delete({
            where: {
                id: idEvent
            }
        })
    }
}