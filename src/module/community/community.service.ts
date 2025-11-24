import { buildPaginatedResponse } from '@common/dto/pagination.dto'
import { LoggerService } from '@common/logger/logger.service'
import { CommunityRepository } from '@module/community/community.repository'
import { CreateCommunityDto } from '@module/community/dto/createCommunity.dto'
import { UpdateCommunityDto } from '@module/community/dto/updateCommunity.dto'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'

@Injectable()
export class CommunityService {
  constructor(
    @Inject(CommunityRepository)
    private readonly communityRepository: CommunityRepository,
    @Inject(LoggerService)
    private readonly logger: LoggerService
  ) {}

  async getAll(take: number, skip: number, options?: { isActive?: boolean, search?: string, baseUrl?: string }) {
    const { data, total } = await this.communityRepository.getAll(take, skip, {
      isActive: options?.isActive,
      search: options?.search
    })

    return buildPaginatedResponse(data, total, {
      take,
      skip,
      baseUrl: options?.baseUrl || '/communities',
      queryParams: {
        isActive: options?.isActive,
        search: options?.search
      }
    })
  }

  async create(data: CreateCommunityDto, userId: string) {
    this.logger.debug('Criando nova comunidade', { userId, communityName: data.name })

    if (!userId) {
      this.logger.error('Tentativa de criar comunidade sem userId')
      throw new Error('UserId é obrigatório para criar comunidade')
    }

    const communityData = {
      ...data,
      supertokensId: userId,
      isActive: data.isActive ?? true
    }

    const user = await this.communityRepository.create(communityData)
    this.logger.log('Comunidade criada com sucesso', { communityId: user.id, userId })
    return user
  }

  async getByID(id: number) {
    await this.isExistCommunity(id)
    return await this.communityRepository.getByID(id)
  }

  async getByUserId(userId: string) {
    return await this.communityRepository.getByUserId(userId)
  }

  async isExistCommunity(id: number) {
    const community = await this.communityRepository.getByID(id)
    if (!community) {
      throw new NotFoundException('Comunidade não encontrada!')
    }
  }

  async update(id: number, data: UpdateCommunityDto) {
    await this.isExistCommunity(id)
    return await this.communityRepository.update(id, data)
  }

  async delete(id: number) {
    await this.isExistCommunity(id)
    await this.communityRepository.delete(id)
  }
}
