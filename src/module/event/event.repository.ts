import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { EventDto } from './dto/event.dto'

@Injectable()
export class EventRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: EventDto, idCommunity: number) {
    return await this.prismaService.event.create({
      data: {
        title: data.title,
        description: data.description,
        start_date_time: data.start_date_time,
        end_date_time: data.end_date_time,
        modality: data.modality,
        is_active: data.is_active,
        link: data.link,
        capa_url: data.capa_url,
        id_community: idCommunity,
        id_address: data.id_address || undefined
      }
    })
  }

  async getByID(id: number) {
    return await this.prismaService.event.findUnique({ where: { id } })
  }

  async getAll(take: number, skip: number) {
    return await this.prismaService.event.findMany({
      take,
      skip,
      include: {
        address: true,
        community: true
      },
      orderBy: {
        created_at: 'desc'
      },
      where: {
        is_active: true
      }
    })
  }

  async update(idEvent: number, data: EventDto) {
    return await this.prismaService.event.updateMany({
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
