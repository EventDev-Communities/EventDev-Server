import { randomUUID } from 'node:crypto'

import { buildPaginatedResponse } from '@common/dto/pagination.dto'
import { LoggerService } from '@common/logger/logger.service'
import { EmailService } from '@infrastructure/email/email.service'
import { CommunityRepository } from '@module/community/community.repository'
import { CreateCommunityDto } from '@module/community/dto/createCommunity.dto'
import { InviteCommunityDto } from '@module/community/dto/inviteCommunity.dto'
import { UpdateCommunityDto } from '@module/community/dto/updateCommunity.dto'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'

import { CommunityInvitation } from '@prisma/client'

@Injectable()
export class CommunityService {
  constructor(
    @Inject(CommunityRepository) private readonly communityRepository: CommunityRepository,
    @Inject(EmailService) private readonly emailService: EmailService,
    @Inject(LoggerService) private readonly logger: LoggerService
  ) {
    this.logger.log('[CommunityService] constructed')
  }

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

    const { ownerId, ...rest } = data
    // ownerId is used for invitation/auth flow, not stored in community table directly
    this.logger.debug('Creating community', { ownerId })
    const communityData = {
      ...rest,
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

  async invite(data: InviteCommunityDto) {
    const token = randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiration

    await this.communityRepository.createInvitation({
      email: data.email,
      name: data.name,
      description: data.description,
      token,
      expiresAt,
      isUsed: false
    })

    // Send email with link
    const link = `https://app.eventdev.org/register/community?token=${token}`
    await this.emailService.sendInvitationEmail(data.email, link, data.name)
    this.logger.log(`Convite criado para ${data.email}. Link: ${link}`)

    return { message: 'Convite enviado com sucesso', link } // Returning link for dev purposes
  }

  async validateInvitation(token: string): Promise<CommunityInvitation> {
    const invitation = await this.communityRepository.getInvitationByToken(token)

    if (!invitation) {
      throw new NotFoundException('Convite inválido')
    }
    if (invitation.isUsed) {
      throw new Error('Convite já utilizado')
    }
    if (invitation.expiresAt < new Date()) {
      throw new Error('Convite expirado')
    }
    return invitation
  }

  async markInvitationAsUsed(id: number) {
    return await this.communityRepository.markInvitationAsUsed(id)
  }
}
