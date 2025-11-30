import { LoggerService } from '@common/logger/logger.service'
import { EmailService } from '@infrastructure/email/email.service'
import { CommunityRepository } from '@module/community/community.repository'
import { CommunityService } from '@module/community/community.service'
import { BadRequestException, ForbiddenException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

describe('CommunityService - Members', () => {
  let service: CommunityService
  // let repository: CommunityRepository

  const mockRepository = {
    getByID: jest.fn(),
    getUserBySupertokensId: jest.fn(),
    isMember: jest.fn(),
    addMember: jest.fn(),
    removeMember: jest.fn(),
    getMembers: jest.fn(),
    getMember: jest.fn(),
    isBanned: jest.fn(),
    banUser: jest.fn()
  }

  const mockEmailService = {
    sendInvitationEmail: jest.fn()
  }

  const mockLogger = {
    log: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityService,
        { provide: CommunityRepository, useValue: mockRepository },
        { provide: EmailService, useValue: mockEmailService },
        { provide: LoggerService, useValue: mockLogger }
      ]
    }).compile()

    service = module.get<CommunityService>(CommunityService)
    // repository = module.get<CommunityRepository>(CommunityRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('join', () => {
    it('should allow a user to join a community', async () => {
      mockRepository.getByID.mockResolvedValue({ id: 1 })
      mockRepository.getUserBySupertokensId.mockResolvedValue({ id: 10 })
      mockRepository.isMember.mockResolvedValue(false)
      mockRepository.addMember.mockResolvedValue({})

      await service.join(1, 'st-id')

      expect(mockRepository.addMember).toHaveBeenCalledWith(1, 10, 'MEMBER')
    })

    it('should throw if user is already a member', async () => {
      mockRepository.getByID.mockResolvedValue({ id: 1 })
      mockRepository.getUserBySupertokensId.mockResolvedValue({ id: 10 })
      mockRepository.isMember.mockResolvedValue(true)

      await expect(service.join(1, 'st-id')).rejects.toThrow(BadRequestException)
    })

    it('should throw if user is banned', async () => {
      mockRepository.getByID.mockResolvedValue({ id: 1 })
      mockRepository.getUserBySupertokensId.mockResolvedValue({ id: 10 })
      mockRepository.isBanned.mockResolvedValue(true)

      await expect(service.join(1, 'st-id')).rejects.toThrow(ForbiddenException)
    })
  })

  describe('removeMember (Ban/Kick)', () => {
    it('should allow OWNER to remove MEMBER', async () => {
      mockRepository.getByID.mockResolvedValue({ id: 1 })
      mockRepository.getUserBySupertokensId.mockResolvedValue({ id: 10 }) // Requester (Owner)

      // Requester is OWNER (Level 1)
      mockRepository.getMember.mockImplementation((communityId, userId) => {
        if (userId === 10) {
          return { role: { level: 1, code: 'OWNER' } }
        }
        if (userId === 20) {
          return { role: { level: 4, code: 'MEMBER' } } // Target
        }
        return null
      })

      await service.removeMember(1, 'st-owner', 20)

      expect(mockRepository.removeMember).toHaveBeenCalledWith(1, 20)
    })

    it('should NOT allow MEMBER to remove anyone', async () => {
      mockRepository.getByID.mockResolvedValue({ id: 1 })
      mockRepository.getUserBySupertokensId.mockResolvedValue({ id: 10 }) // Requester (Member)

      // Requester is MEMBER (Level 4)
      mockRepository.getMember.mockResolvedValue({ role: { level: 4, code: 'MEMBER' } })

      await expect(service.removeMember(1, 'st-member', 20)).rejects.toThrow(ForbiddenException)
    })

    it('should NOT allow ADMIN to remove OWNER', async () => {
      mockRepository.getByID.mockResolvedValue({ id: 1 })
      mockRepository.getUserBySupertokensId.mockResolvedValue({ id: 10 }) // Requester (Admin)

      // Requester is ADMIN (Level 2)
      // Target is OWNER (Level 1)
      mockRepository.getMember.mockImplementation((communityId, userId) => {
        if (userId === 10) {
          return { role: { level: 2, code: 'ADMIN' } }
        }
        if (userId === 20) {
          return { role: { level: 1, code: 'OWNER' } }
        }
        return null
      })

      await expect(service.removeMember(1, 'st-admin', 20)).rejects.toThrow(ForbiddenException)
    })

    it('should ban user after removing', async () => {
      mockRepository.getByID.mockResolvedValue({ id: 1 })
      mockRepository.getUserBySupertokensId.mockResolvedValue({ id: 10 }) // Requester (Owner)

      mockRepository.getMember.mockImplementation((communityId, userId) => {
        if (userId === 10) {
          return { role: { level: 1, code: 'OWNER' } }
        }
        if (userId === 20) {
          return { role: { level: 4, code: 'MEMBER' } } // Target
        }
        return null
      })

      await service.removeMember(1, 'st-owner', 20)

      expect(mockRepository.removeMember).toHaveBeenCalledWith(1, 20)
      expect(mockRepository.banUser).toHaveBeenCalledWith(1, 20, expect.any(String))
    })
  })
})
