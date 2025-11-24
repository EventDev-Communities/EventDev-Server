import { CreateCommunityDto } from '@module/community/dto/createCommunity.dto'
import { UpdateCommunityDto } from '@module/community/dto/updateCommunity.dto'
import { Inject, Injectable } from '@nestjs/common'
import { PrismaService } from '@prisma/prisma.service'

@Injectable()
export class CommunityRepository {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

  async getAll(take: number, skip: number, filters?: { isActive?: boolean, search?: string }) {
    const where: { isActive?: boolean, OR?: Array<{ name?: { contains: string, mode: 'insensitive' }, description?: { contains: string, mode: 'insensitive' } }> } = {}

    if (filters?.isActive === undefined) {
      where.isActive = true // Default: apenas comunidades ativas
    } else {
      where.isActive = filters.isActive
    }

    if (typeof filters?.search === 'string' && filters.search.length > 0) {
      where.OR = [{ name: { contains: filters.search, mode: 'insensitive' } }, { description: { contains: filters.search, mode: 'insensitive' } }]
    }

    const [data, total] = await Promise.all([
      this.prismaService.community.findMany({
        take,
        skip,
        where,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prismaService.community.count({ where })
    ])

    return { data, total }
  }

  async create(data: CreateCommunityDto & { supertokensId: string }) {
    return await this.prismaService.community.create({
      data
    })
  }

  async getByID(id: number) {
    return await this.prismaService.community.findUnique({ where: { id } })
  }

  async getByUserId(userId: string) {
    return await this.prismaService.community.findUnique({
      where: { supertokensId: userId }
    })
  }

  async update(id: number, data: UpdateCommunityDto) {
    return await this.prismaService.community.update({
      where: {
        id
      },
      data
    })
  }

  async delete(id: number) {
    await this.prismaService.community.delete({ where: { id } })
  }
}
