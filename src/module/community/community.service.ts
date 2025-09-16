import { Injectable, NotFoundException } from '@nestjs/common'
import { CommunityRepository } from './community.repository'
import { UpdateCommunityDto } from './dto/updateCommunity.dto'
import { CreateCommunityDto } from './dto/createCommunity.dto'

@Injectable()
export class CommunityService {
  constructor(private readonly communityRepository: CommunityRepository) {}

  async getAll(take: number, skip: number) {
    return await this.communityRepository.getAll(take, skip)
  }

  async create(data: CreateCommunityDto, userId: string) {
    console.log('=== COMMUNITY SERVICE CREATE ===')
    console.log('Data recebida:', data)
    console.log('UserId recebido:', userId)

    if (!userId) {
      throw new Error('UserId é obrigatório para criar comunidade')
    }

    const communityData = {
      ...data,
      supertokens_id: userId,
      is_active: data.is_active ?? true // Define como true se não fornecido
    }

    console.log('CommunityData final:', communityData)
    console.log('================================')

    const user = await this.communityRepository.create(communityData)
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
    if (!(await this.communityRepository.getByID(id))) throw new NotFoundException('Comunidade não encontrada!')
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
