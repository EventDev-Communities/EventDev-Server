import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { EventDto } from './dto/event.dto'

@Injectable()
export class EventRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: EventDto, idCommunity: number, idAddress?: number | null) {
    const prismaData = {
      title: data.name, 
      name: data.name,
      description: data.description,
      start_date_time: data.data_hora_inicial,
      end_date_time: data.data_hora_final,
      modality: data.modalidade,
      link: data.link,
      banner_url: data.banner_url,
      is_active: data.is_active ?? true,
      id_community: idCommunity,
      ...(idAddress && { id_address: idAddress })
    }

    return await this.prismaService.event.create({
      data: prismaData
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
        address: true
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
