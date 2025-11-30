import { CommunityController } from '@module/community/community.controller'
import { CommunityService } from '@module/community/community.service'
import { CreateCommunityDto } from '@module/community/dto/create-community.dto'
import { InviteCommunityDto } from '@module/community/dto/invite-community.dto'
import { UpdateCommunityDto } from '@module/community/dto/update-community.dto'
import { Test, TestingModule } from '@nestjs/testing'

describe('CommunityController', () => {
  let controller: CommunityController
  // let service: CommunityService

  const mockCommunityService = {
    getAll: jest.fn(),
    getByUserId: jest.fn(),
    create: jest.fn(),
    getByID: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    invite: jest.fn(),
    validateInvitation: jest.fn(),
    join: jest.fn(),
    leave: jest.fn(),
    getMembers: jest.fn(),
    removeMember: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityController],
      providers: [
        {
          provide: CommunityService,
          useValue: mockCommunityService
        }
      ]
    }).compile()

    controller = module.get<CommunityController>(CommunityController)
    // service = module.get<CommunityService>(CommunityService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getAll', () => {
    it('should return a list of communities', async () => {
      const result = { data: [], meta: {} }
      mockCommunityService.getAll.mockResolvedValue(result)

      expect(await controller.getAll(20, 0)).toBe(result)
      expect(mockCommunityService.getAll).toHaveBeenCalledWith(20, 0, expect.any(Object))
    })

    it('should handle missing request object', async () => {
      const result = { data: [], meta: {} }
      mockCommunityService.getAll.mockResolvedValue(result)

      expect(await controller.getAll(20, 0)).toBe(result)
      expect(mockCommunityService.getAll).toHaveBeenCalledWith(20, 0, {
        isActive: undefined,
        search: undefined,
        baseUrl: '/communities'
      })
    })

    it('should use request object to build baseUrl', async () => {
      const result = { data: [], meta: {} }
      mockCommunityService.getAll.mockResolvedValue(result)
      const req = {
        protocol: 'https',
        get: jest.fn().mockReturnValue('example.com'),
        baseUrl: '/api/communities'
      }

      expect(await controller.getAll(20, 0, undefined, undefined, req as any)).toBe(result)
      expect(mockCommunityService.getAll).toHaveBeenCalledWith(20, 0, {
        isActive: undefined,
        search: undefined,
        baseUrl: 'https://example.com/api/communities'
      })
    })
  })

  describe('getMyCommunity', () => {
    it('should return the user community', async () => {
      const user = { id: 'user-id' }
      const result = { id: 1, name: 'Test Community' }
      mockCommunityService.getByUserId.mockResolvedValue(result)

      expect(await controller.getMyCommunity(user as any)).toBe(result)
      expect(mockCommunityService.getByUserId).toHaveBeenCalledWith('user-id')
    })
  })

  describe('create', () => {
    it('should create a new community', async () => {
      const dto: CreateCommunityDto = { name: 'New Community', description: 'Desc', ownerId: 'user-id' }
      const result = { id: 1, ...dto }
      mockCommunityService.create.mockResolvedValue(result)

      expect(await controller.create(dto)).toBe(result)
      expect(mockCommunityService.create).toHaveBeenCalledWith(dto, 'user-id')
    })
  })

  describe('getByID', () => {
    it('should return a community by ID', async () => {
      const result = { id: 1, name: 'Community' }
      mockCommunityService.getByID.mockResolvedValue(result)

      expect(await controller.getByID(1)).toBe(result)
      expect(mockCommunityService.getByID).toHaveBeenCalledWith(1)
    })
  })

  describe('update', () => {
    it('should update a community', async () => {
      const dto: UpdateCommunityDto = { name: 'Updated Name' }
      const result = { id: 1, ...dto }
      mockCommunityService.update.mockResolvedValue(result)

      expect(await controller.update(1, dto)).toBe(result)
      expect(mockCommunityService.update).toHaveBeenCalledWith(1, dto)
    })
  })

  describe('delete', () => {
    it('should delete a community', async () => {
      mockCommunityService.delete.mockResolvedValue(undefined)

      expect(await controller.delete(1)).toBeUndefined()
      expect(mockCommunityService.delete).toHaveBeenCalledWith(1)
    })
  })

  describe('invite', () => {
    it('should invite a member', async () => {
      const dto: InviteCommunityDto = { email: 'test@example.com', name: 'Community' }
      const result = { token: 'token' }
      mockCommunityService.invite.mockResolvedValue(result)

      expect(await controller.invite(dto)).toBe(result)
      expect(mockCommunityService.invite).toHaveBeenCalledWith(dto)
    })
  })

  describe('validateInvite', () => {
    it('should return invite info', async () => {
      const result = { email: 'test@example.com' }
      mockCommunityService.validateInvitation.mockResolvedValue(result)

      expect(await controller.validateInvite('token')).toBe(result)
      expect(mockCommunityService.validateInvitation).toHaveBeenCalledWith('token')
    })
  })

  describe('join', () => {
    it('should join a community', async () => {
      const result = { success: true }
      mockCommunityService.join.mockResolvedValue(result)

      expect(await controller.join(1, { id: 'user-id' } as any)).toBe(result)
      expect(mockCommunityService.join).toHaveBeenCalledWith(1, 'user-id')
    })
  })

  describe('leave', () => {
    it('should leave a community', async () => {
      const result = { success: true }
      mockCommunityService.leave.mockResolvedValue(result)

      expect(await controller.leave(1, { id: 'user-id' } as any)).toBe(result)
      expect(mockCommunityService.leave).toHaveBeenCalledWith(1, 'user-id')
    })
  })

  describe('getMembers', () => {
    it('should return community members', async () => {
      const result = [{ id: 'user-id' }]
      mockCommunityService.getMembers.mockResolvedValue(result)

      expect(await controller.getMembers(1, 20, 0)).toBe(result)
      expect(mockCommunityService.getMembers).toHaveBeenCalledWith(1, 20, 0)
    })
  })

  describe('removeMember', () => {
    it('should remove a member', async () => {
      const result = { success: true }
      mockCommunityService.removeMember.mockResolvedValue(result)
      const user = { id: 'admin-id' }

      expect(await controller.removeMember(1, 2, user as any)).toBe(result)
      expect(mockCommunityService.removeMember).toHaveBeenCalledWith(1, 'admin-id', 2)
    })
  })
})
