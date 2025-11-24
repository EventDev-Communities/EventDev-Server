import { TicketDto } from '@module/ticket/dto/ticket.dto'
import { Inject, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@prisma/prisma.service'

@Injectable()
export class TicketRepository {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {
    // eslint-disable-next-line no-console
    console.log('[TicketRepository] constructed')
  }

  async create(data: TicketDto, idCommunity: number) {
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

  async getAll(take: number, skip: number, filters?: { eventId?: number, isActive?: boolean }) {
    const where: Prisma.TicketWhereInput = {}

    if (filters?.eventId) {
      where.eventId = filters.eventId
    }

    const [data, total] = await Promise.all([
      this.prismaService.ticket.findMany({
        take,
        skip,
        include: {
          event: {
            include: {
              community: true
            }
          },
          status: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        where
      }),
      this.prismaService.ticket.count({ where })
    ])

    return { data, total }
  }

  async update(idEvent: number, data: TicketDto) {
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
