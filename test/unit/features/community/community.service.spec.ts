import { LoggerService } from '@common/logger/logger.service'
import { EmailService } from '@infrastructure/email/email.service'
import { CommunityRepository } from '@module/community/community.repository'
import { CommunityService } from '@module/community/community.service'
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

describe('CommunityService', () => {
  let service: CommunityService

  const mockRepository = {
    getAll: jest.fn(),
    create: jest.fn(),
    getByID: jest.fn(),
    getByUserId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createInvitation: jest.fn(),
    getInvitationByToken: jest.fn(),
    markInvitationAsUsed: jest.fn(),
    getUserBySupertokensId: jest.fn(),
    isBanned: jest.fn(),
    isMember: jest.fn(),
    addMember: jest.fn(),
    removeMember: jest.fn(),
    getMembers: jest.fn(),
    getMember: jest.fn(),
    banUser: jest.fn()
  }

  const mockLogger = {
    log: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
  }

  const mockEmailService = {
    sendInvitationEmail: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityService,
        { provide: CommunityRepository, useValue: mockRepository },
        { provide: LoggerService, useValue: mockLogger },
        { provide: EmailService, useValue: mockEmailService }
      ]
    }).compile()

    service = module.get<CommunityService>(CommunityService)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getAll', () => {
    it('should return paginated response', async () => {
      mockRepository.getAll.mockResolvedValue({ data: [], total: 0 })
      const result = await service.getAll(10, 0)
      expect(result).toMatchSnapshot()
    })
  })

  describe('create', () => {
    it('should create a community', async () => {
      const userId = 'user-123'
      const dto = { name: 'Test Community', description: 'Test', ownerId: userId }
      mockRepository.create.mockResolvedValue({ id: 1, ...dto })

      const result = await service.create(dto, userId)
      expect(result).toHaveProperty('id')
      expect(mockRepository.create).toHaveBeenCalled()
    })

    it('should throw error if userId is missing', async () => {
      await expect(service.create({ name: 'Test', ownerId: '' }, '')).rejects.toThrow('UserId é obrigatório')
    })
  })

  describe('getByID', () => {
    it('should return community if exists', async () => {
      mockRepository.getByID.mockResolvedValue({ id: 1 })
      const result = await service.getByID(1)
      expect(result).toEqual({ id: 1 })
    })

    it('should throw NotFoundException if not exists', async () => {
      mockRepository.getByID.mockResolvedValue(null)
      await expect(service.getByID(1)).rejects.toThrow(NotFoundException)
    })
  })

  describe('getByUserId', () => {
    it('should return community by user id', async () => {
      mockRepository.getByUserId.mockResolvedValue({ id: 1 })
      const result = await service.getByUserId('user-123')
      expect(result).toEqual({ id: 1 })
    })
  })

  describe('update', () => {
    it('should update community if exists', async () => {
      mockRepository.getByID.mockResolvedValue({ id: 1 })
      mockRepository.update.mockResolvedValue({ id: 1, name: 'Updated' })

      const result = await service.update(1, { name: 'Updated' })
      expect(result.name).toBe('Updated')
    })

    it('should throw NotFoundException if community does not exist', async () => {
      mockRepository.getByID.mockResolvedValue(null)
      await expect(service.update(1, { name: 'Updated' })).rejects.toThrow(NotFoundException)
    })
  })

  describe('delete', () => {
    it('should delete community if exists', async () => {
      mockRepository.getByID.mockResolvedValue({ id: 1 })
      mockRepository.delete.mockResolvedValue({ id: 1 })

      await service.delete(1)
      expect(mockRepository.delete).toHaveBeenCalledWith(1)
    })

    it('should throw NotFoundException if community does not exist', async () => {
      mockRepository.getByID.mockResolvedValue(null)
      await expect(service.delete(1)).rejects.toThrow(NotFoundException)
    })
  })

  describe('invite', () => {
    it('should create invitation and send email', async () => {
      const dto = { email: 'test@example.com', name: 'Test', description: 'Desc' }
      mockRepository.createInvitation.mockResolvedValue({ id: 1 })

      const result = await service.invite(dto)

      expect(mockRepository.createInvitation).toHaveBeenCalled()
      expect(mockEmailService.sendInvitationEmail).toHaveBeenCalled()
      expect(result.message).toBe('Convite enviado com sucesso')
    })
  })

  describe('validateInvitation', () => {
    it('should return invitation if valid', async () => {
      const invitation = { id: 1, isUsed: false, expiresAt: new Date(Date.now() + 10000) }
      mockRepository.getInvitationByToken.mockResolvedValue(invitation)

      const result = await service.validateInvitation('token')
      expect(result).toEqual(invitation)
    })

    it('should throw NotFoundException if invitation not found', async () => {
      mockRepository.getInvitationByToken.mockResolvedValue(null)
      await expect(service.validateInvitation('token')).rejects.toThrow(NotFoundException)
    })

    it('should throw Error if invitation is used', async () => {
      const invitation = { id: 1, isUsed: true, expiresAt: new Date(Date.now() + 10000) }
      mockRepository.getInvitationByToken.mockResolvedValue(invitation)
      await expect(service.validateInvitation('token')).rejects.toThrow('Convite já utilizado')
    })

    it('should throw Error if invitation is expired', async () => {
      const invitation = { id: 1, isUsed: false, expiresAt: new Date(Date.now() - 10000) }
      mockRepository.getInvitationByToken.mockResolvedValue(invitation)
      await expect(service.validateInvitation('token')).rejects.toThrow('Convite expirado')
    })
  })

  describe('markInvitationAsUsed', () => {
    it('should mark invitation as used', async () => {
      mockRepository.markInvitationAsUsed.mockResolvedValue({ id: 1, isUsed: true })
      const result = await service.markInvitationAsUsed(1)
      expect(result.isUsed).toBe(true)
    })
  })

  describe('join', () => {
    it('should join community successfully', async () => {
      mockRepository.getByID.mockResolvedValue({ id: 1 })
      mockRepository.getUserBySupertokensId.mockResolvedValue({ id: 10 })
      mockRepository.isBanned.mockResolvedValue(false)
      mockRepository.isMember.mockResolvedValue(false)

      const result = await service.join(1, 'user-st-id')
      expect(result.message).toBe('Entrou na comunidade com sucesso')
      expect(mockRepository.addMember).toHaveBeenCalledWith(1, 10, 'MEMBER')
    })

    it('should throw NotFoundException if community not found', async () => {
      mockRepository.getByID.mockResolvedValue(null)
      await expect(service.join(1, 'user-st-id')).rejects.toThrow(NotFoundException)
    })

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.getByID.mockResolvedValue({ id: 1 })
      mockRepository.getUserBySupertokensId.mockResolvedValue(null)
      await expect(service.join(1, 'user-st-id')).rejects.toThrow(NotFoundException)
    })

    it('should throw ForbiddenException if user is banned', async () => {
      mockRepository.getByID.mockResolvedValue({ id: 1 })
      mockRepository.getUserBySupertokensId.mockResolvedValue({ id: 10 })
      mockRepository.isBanned.mockResolvedValue(true)
      await expect(service.join(1, 'user-st-id')).rejects.toThrow(ForbiddenException)
    })

    it('should throw BadRequestException if user is already member', async () => {
      mockRepository.getByID.mockResolvedValue({ id: 1 })
      mockRepository.getUserBySupertokensId.mockResolvedValue({ id: 10 })
      mockRepository.isBanned.mockResolvedValue(false)
      mockRepository.isMember.mockResolvedValue(true)
      await expect(service.join(1, 'user-st-id')).rejects.toThrow(BadRequestException)
    })
  })

  describe('leave', () => {
    it('should leave community successfully', async () => {
      mockRepository.getByID.mockResolvedValue({ id: 1 })
      mockRepository.getUserBySupertokensId.mockResolvedValue({ id: 10 })
      mockRepository.isMember.mockResolvedValue(true)

      const result = await service.leave(1, 'user-st-id')
      expect(result.message).toBe('Saiu da comunidade com sucesso')
      expect(mockRepository.removeMember).toHaveBeenCalledWith(1, 10)
    })

    it('should throw BadRequestException if user is not member', async () => {
      mockRepository.getByID.mockResolvedValue({ id: 1 })
      mockRepository.getUserBySupertokensId.mockResolvedValue({ id: 10 })
      mockRepository.isMember.mockResolvedValue(false)
      await expect(service.leave(1, 'user-st-id')).rejects.toThrow(BadRequestException)
    })
  })

  describe('getMembers', () => {
    it('should return paginated members', async () => {
      mockRepository.getByID.mockResolvedValue({ id: 1 })
      mockRepository.getMembers.mockResolvedValue({ data: [], total: 0 })

      const result = await service.getMembers(1, 10, 0)
      expect(result).toMatchSnapshot()
    })
  })

  describe('removeMember', () => {
    it('should remove member successfully', async () => {
      mockRepository.getByID.mockResolvedValue({ id: 1 })
      mockRepository.getUserBySupertokensId.mockResolvedValue({ id: 10 }) // Requester
      mockRepository.getMember.mockImplementation((communityId, userId) => {
        if (userId === 10) {
          return { role: { level: 1 } }
        } // Owner
        if (userId === 20) {
          return { role: { level: 3 } }
        } // Member
        return null
      })

      const result = await service.removeMember(1, 'requester-id', 20)
      expect(result.message).toBe('Membro removido e banido com sucesso')
      expect(mockRepository.removeMember).toHaveBeenCalledWith(1, 20)
      expect(mockRepository.banUser).toHaveBeenCalledWith(1, 20, expect.any(String))
    })

    it('should throw ForbiddenException if requester is not member', async () => {
      mockRepository.getByID.mockResolvedValue({ id: 1 })
      mockRepository.getUserBySupertokensId.mockResolvedValue({ id: 10 })
      mockRepository.getMember.mockResolvedValue(null)

      await expect(service.removeMember(1, 'requester-id', 20)).rejects.toThrow(ForbiddenException)
    })

    it('should throw ForbiddenException if requester has low level', async () => {
      mockRepository.getByID.mockResolvedValue({ id: 1 })
      mockRepository.getUserBySupertokensId.mockResolvedValue({ id: 10 })
      mockRepository.getMember.mockResolvedValue({ role: { level: 3 } }) // Member

      await expect(service.removeMember(1, 'requester-id', 20)).rejects.toThrow(ForbiddenException)
    })

    it('should throw ForbiddenException if target has higher or equal level', async () => {
      mockRepository.getByID.mockResolvedValue({ id: 1 })
      mockRepository.getUserBySupertokensId.mockResolvedValue({ id: 10 })
      mockRepository.getMember.mockImplementation((communityId, userId) => {
        if (userId === 10) {
          return { role: { level: 2 } }
        } // Admin
        if (userId === 20) {
          return { role: { level: 2 } }
        } // Admin
        return null
      })

      await expect(service.removeMember(1, 'requester-id', 20)).rejects.toThrow(ForbiddenException)
    })
  })
})
