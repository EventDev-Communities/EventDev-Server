import { PrismaService } from '@db/prisma.service'
import { CommunityRepository } from '@module/community/community.repository'
import { Test, TestingModule } from '@nestjs/testing'

describe('CommunityRepository', () => {
  let repository: CommunityRepository

  const mockPrismaService = {
    community: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    communityMember: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn()
    },
    communityInvitation: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    },
    userRole: {
      findUnique: jest.fn()
    },
    communityUser: {
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn()
    },
    user: {
      findUnique: jest.fn()
    },
    communityBan: {
      create: jest.fn(),
      count: jest.fn(),
      delete: jest.fn()
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile()

    repository = module.get<CommunityRepository>(CommunityRepository)
  })

  it('should be defined', () => {
    expect(repository).toBeDefined()
  })

  describe('getAll', () => {
    it('should return paginated communities with default filters', async () => {
      const mockCommunities = [{ id: 1, name: 'Community 1' }]
      mockPrismaService.community.findMany.mockResolvedValue(mockCommunities)
      mockPrismaService.community.count.mockResolvedValue(1)

      const result = await repository.getAll(10, 0)

      expect(result).toEqual({ data: mockCommunities, total: 1 })
      expect(mockPrismaService.community.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      })
    })

    it('should apply search filter', async () => {
      const mockCommunities = [{ id: 1, name: 'Test Community' }]
      mockPrismaService.community.findMany.mockResolvedValue(mockCommunities)
      mockPrismaService.community.count.mockResolvedValue(1)

      await repository.getAll(10, 0, { search: 'Test' })

      expect(mockPrismaService.community.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'Test', mode: 'insensitive' } },
              { description: { contains: 'Test', mode: 'insensitive' } }
            ]
          })
        })
      )
    })
  })

  describe('create', () => {
    it('should create a community', async () => {
      const data = { name: 'New Community', supertokensId: 'user-id' }
      const createdCommunity = { id: 1, ...data }
      mockPrismaService.community.create.mockResolvedValue(createdCommunity)

      const result = await repository.create(data as any)

      expect(result).toEqual(createdCommunity)
      expect(mockPrismaService.community.create).toHaveBeenCalledWith({ data })
    })
  })

  describe('getByID', () => {
    it('should return a community by id', async () => {
      const community = { id: 1, name: 'Community 1' }
      mockPrismaService.community.findUnique.mockResolvedValue(community)

      const result = await repository.getByID(1)

      expect(result).toEqual(community)
      expect(mockPrismaService.community.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      })
    })
  })

  describe('getByUserId', () => {
    it('should return a community by user id', async () => {
      const community = { id: 1, supertokensId: 'user-id' }
      mockPrismaService.community.findUnique.mockResolvedValue(community)

      const result = await repository.getByUserId('user-id')

      expect(result).toEqual(community)
      expect(mockPrismaService.community.findUnique).toHaveBeenCalledWith({
        where: { supertokensId: 'user-id' }
      })
    })
  })

  describe('update', () => {
    it('should update a community', async () => {
      const data = { name: 'Updated Name' }
      const updatedCommunity = { id: 1, ...data }
      mockPrismaService.community.update.mockResolvedValue(updatedCommunity)

      const result = await repository.update(1, data)

      expect(result).toEqual(updatedCommunity)
      expect(mockPrismaService.community.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data
      })
    })
  })

  describe('delete', () => {
    it('should delete a community', async () => {
      mockPrismaService.community.delete = jest.fn().mockResolvedValue({ id: 1 })
      await repository.delete(1)
      expect(mockPrismaService.community.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      })
    })
  })

  describe('createInvitation', () => {
    it('should create an invitation', async () => {
      const data = {
        communityId: 1,
        token: 'token',
        expiresAt: new Date(),
        roleId: 1,
        email: 'test@example.com',
        name: 'Test User'
      }
      const invitation = { id: 1, ...data }
      mockPrismaService.communityInvitation.create.mockResolvedValue(invitation)

      const result = await repository.createInvitation(data)
      expect(result).toEqual(invitation)
      expect(mockPrismaService.communityInvitation.create).toHaveBeenCalledWith(
        { data }
      )
    })
  })

  describe('getInvitationByToken', () => {
    it('should return invitation by token', async () => {
      const invitation = { id: 1, token: 'token' }
      mockPrismaService.communityInvitation.findUnique.mockResolvedValue(
        invitation
      )

      const result = await repository.getInvitationByToken('token')
      expect(result).toEqual(invitation)
      expect(
        mockPrismaService.communityInvitation.findUnique
      ).toHaveBeenCalledWith({ where: { token: 'token' } })
    })
  })

  describe('markInvitationAsUsed', () => {
    it('should mark invitation as used', async () => {
      const invitation = { id: 1, isUsed: true }
      mockPrismaService.communityInvitation.update.mockResolvedValue(invitation)

      const result = await repository.markInvitationAsUsed(1)
      expect(result).toEqual(invitation)
      expect(mockPrismaService.communityInvitation.update).toHaveBeenCalledWith(
        { where: { id: 1 }, data: { isUsed: true } }
      )
    })
  })

  describe('addMember', () => {
    it('should add a member', async () => {
      const role = { id: 1, code: 'MEMBER' }
      mockPrismaService.userRole.findUnique.mockResolvedValue(role)
      const member = { communityId: 1, userId: 1, roleId: 1 }
      mockPrismaService.communityUser.create.mockResolvedValue(member)

      const result = await repository.addMember(1, 1, 'MEMBER')
      expect(result).toEqual(member)
      expect(mockPrismaService.userRole.findUnique).toHaveBeenCalledWith({
        where: { code: 'MEMBER' }
      })
      expect(mockPrismaService.communityUser.create).toHaveBeenCalledWith({
        data: { communityId: 1, userId: 1, roleId: 1 }
      })
    })

    it('should throw error if role not found', async () => {
      mockPrismaService.userRole.findUnique.mockResolvedValue(null)
      await expect(repository.addMember(1, 1, 'INVALID')).rejects.toThrow(
        'Role INVALID not found'
      )
    })
  })

  describe('removeMember', () => {
    it('should remove a member', async () => {
      mockPrismaService.communityUser.delete.mockResolvedValue({
        communityId: 1,
        userId: 1
      })
      await repository.removeMember(1, 1)
      expect(mockPrismaService.communityUser.delete).toHaveBeenCalledWith({
        where: { communityId_userId: { communityId: 1, userId: 1 } }
      })
    })
  })

  describe('isMember', () => {
    it('should return true if member exists', async () => {
      mockPrismaService.communityUser.count.mockResolvedValue(1)
      const result = await repository.isMember(1, 1)
      expect(result).toBe(true)
    })

    it('should return false if member does not exist', async () => {
      mockPrismaService.communityUser.count.mockResolvedValue(0)
      const result = await repository.isMember(1, 1)
      expect(result).toBe(false)
    })
  })

  describe('getMembers', () => {
    it('should return paginated members', async () => {
      const members = [{ userId: 1 }]
      mockPrismaService.communityUser.findMany.mockResolvedValue(members)
      mockPrismaService.communityUser.count.mockResolvedValue(1)

      const result = await repository.getMembers(1, 10, 0)
      expect(result).toEqual({ data: members, total: 1 })
      expect(mockPrismaService.communityUser.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { communityId: 1 } })
      )
    })
  })

  describe('getMember', () => {
    it('should return a member', async () => {
      const member = { userId: 1 }
      mockPrismaService.communityUser.findUnique.mockResolvedValue(member)
      const result = await repository.getMember(1, 1)
      expect(result).toEqual(member)
      expect(mockPrismaService.communityUser.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { communityId_userId: { communityId: 1, userId: 1 } }
        })
      )
    })
  })

  describe('getUserBySupertokensId', () => {
    it('should return user by supertokens id', async () => {
      const user = { id: 1, supertokensId: 'st-id' }
      mockPrismaService.user.findUnique.mockResolvedValue(user)
      const result = await repository.getUserBySupertokensId('st-id')
      expect(result).toEqual(user)
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { supertokensId: 'st-id' }
      })
    })
  })

  describe('banUser', () => {
    it('should ban a user', async () => {
      const ban = { communityId: 1, userId: 1, reason: 'spam' }
      mockPrismaService.communityBan.create.mockResolvedValue(ban)
      const result = await repository.banUser(1, 1, 'spam')
      expect(result).toEqual(ban)
      expect(mockPrismaService.communityBan.create).toHaveBeenCalledWith({
        data: { communityId: 1, userId: 1, reason: 'spam' }
      })
    })
  })

  describe('isBanned', () => {
    it('should return true if user is banned', async () => {
      mockPrismaService.communityBan.count.mockResolvedValue(1)
      const result = await repository.isBanned(1, 1)
      expect(result).toBe(true)
    })
  })

  describe('unbanUser', () => {
    it('should unban a user', async () => {
      mockPrismaService.communityBan.delete.mockResolvedValue({
        communityId: 1,
        userId: 1
      })
      await repository.unbanUser(1, 1)
      expect(mockPrismaService.communityBan.delete).toHaveBeenCalledWith({
        where: { communityId_userId: { communityId: 1, userId: 1 } }
      })
    })
  })
})
