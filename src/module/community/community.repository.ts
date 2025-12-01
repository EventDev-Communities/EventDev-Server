import { PrismaService } from '@db/prisma.service'
import { UpdateCommunityDto } from '@module/community/dto/update-community.dto'
import { Inject, Injectable } from '@nestjs/common'
import { CommunityInvitation, Prisma } from '@prisma/client'

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

  async create(data: Prisma.CommunityCreateInput) {
    return await this.prismaService.community.create({
      data
    })
  }

  async getByID(id: number) {
    return await this.prismaService.community.findUnique({
      where: { id },
      include: {
        links: {
          include: {
            linkType: true
          }
        }
      }
    })
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

  async createInvitation(data: Prisma.CommunityInvitationCreateInput): Promise<CommunityInvitation> {
    return await this.prismaService.communityInvitation.create({
      data
    })
  }

  async getInvitationByToken(token: string): Promise<CommunityInvitation | null> {
    return await this.prismaService.communityInvitation.findUnique({
      where: { token }
    })
  }

  async markInvitationAsUsed(id: number): Promise<CommunityInvitation> {
    return await this.prismaService.communityInvitation.update({
      where: { id },
      data: { isUsed: true }
    })
  }

  async addMember(communityId: number, userId: number, roleCode: string) {
    const role = await this.prismaService.userRole.findUnique({
      where: { code: roleCode }
    })

    if (!role) {
      throw new Error(`Role ${roleCode} not found`)
    }

    return await this.prismaService.communityUser.create({
      data: {
        communityId,
        userId,
        roleId: role.id
      }
    })
  }

  async removeMember(communityId: number, userId: number) {
    return await this.prismaService.communityUser.delete({
      where: {
        communityId_userId: {
          communityId,
          userId
        }
      }
    })
  }

  async isMember(communityId: number, userId: number) {
    const count = await this.prismaService.communityUser.count({
      where: {
        communityId,
        userId
      }
    })
    return count > 0
  }

  async getMembers(communityId: number, take: number, skip: number) {
    const [data, total] = await Promise.all([
      this.prismaService.communityUser.findMany({
        where: { communityId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              supertokensId: true
              // Add other user fields if needed
            }
          },
          role: true
        },
        take,
        skip,
        orderBy: {
          joinedAt: 'desc'
        }
      }),
      this.prismaService.communityUser.count({
        where: { communityId }
      })
    ])

    return { data, total }
  }

  async getMember(communityId: number, userId: number) {
    return await this.prismaService.communityUser.findUnique({
      where: {
        communityId_userId: {
          communityId,
          userId
        }
      },
      include: {
        role: true
      }
    })
  }

  async getUserBySupertokensId(supertokensId: string) {
    return await this.prismaService.user.findUnique({
      where: { supertokensId }
    })
  }

  async banUser(communityId: number, userId: number, reason?: string) {
    return await this.prismaService.communityBan.create({
      data: {
        communityId,
        userId,
        reason
      }
    })
  }

  async isBanned(communityId: number, userId: number) {
    const count = await this.prismaService.communityBan.count({
      where: {
        communityId,
        userId
      }
    })
    return count > 0
  }

  async unbanUser(communityId: number, userId: number) {
    return await this.prismaService.communityBan.delete({
      where: {
        communityId_userId: {
          communityId,
          userId
        }
      }
    })
  }
}
