import { PrismaService } from '@db/prisma.service'
import { EventDto } from '@module/event/dto/event.dto'
import { Inject, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

@Injectable()
export class EventRepository {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

  async create(data: EventDto, idCommunity: number) {
    const modality = await this.prismaService.eventModality.findUnique({
      where: { code: data.modality }
    })

    if (!modality) {
      throw new Error(`Event modality ${data.modality} not found`)
    }

    return await this.prismaService.event.create({
      data: {
        title: data.title,
        description: data.description,
        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
        modalityId: modality.id,
        isActive: data.isActive,
        link: data.link,
        coverUrl: data.coverUrl,
        communityId: idCommunity,
        addressId: data.addressId || undefined
      }
    })
  }

  async getByID(id: number) {
    return await this.prismaService.event.findUnique({ where: { id } })
  }

  async getAll(take: number, skip: number, filters?: { communityId?: number, modality?: string, isActive?: boolean }) {
    const where: Prisma.EventWhereInput = {}

    if (filters?.communityId) {
      where.communityId = filters.communityId
    }

    if (filters?.modality) {
      const modality = await this.prismaService.eventModality.findUnique({
        where: { code: filters.modality }
      })
      if (modality) {
        where.modalityId = modality.id
      }
    }

    if (filters?.isActive === undefined) {
      where.isActive = true // Default: apenas eventos ativos
    } else {
      where.isActive = filters.isActive
    }

    const [data, total] = await Promise.all([
      this.prismaService.event.findMany({
        take,
        skip,
        include: {
          address: true,
          community: true,
          modality: true
        },
        orderBy: {
          startDateTime: 'asc'
        },
        where
      }),
      this.prismaService.event.count({ where })
    ])

    return { data, total }
  }

  async update(idEvent: number, data: EventDto) {
    return await this.prismaService.event.updateMany({
      where: {
        id: idEvent
      },
      data
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
