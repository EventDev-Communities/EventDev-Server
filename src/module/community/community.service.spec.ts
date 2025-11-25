import { LoggerService } from '@common/logger/logger.service'
import { CommunityRepository } from '@module/community/community.repository'
import { CommunityService } from '@module/community/community.service'
import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

describe('CommunityService', () => {
  let service: CommunityService

  const mockRepository = {
    getAll: jest.fn(),
    create: jest.fn(),
    getByID: jest.fn(),
    getByUserId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
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
        { provide: LoggerService, useValue: mockLogger }
      ]
    }).compile()

    service = module.get<CommunityService>(CommunityService)
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
      const dto = { name: 'Test Community', description: 'Test' }
      const userId = 'user-123'
      mockRepository.create.mockResolvedValue({ id: 1, ...dto })

      const result = await service.create(dto, userId)
      expect(result).toHaveProperty('id')
      expect(mockRepository.create).toHaveBeenCalled()
    })

    it('should throw error if userId is missing', async () => {
      await expect(service.create({ name: 'Test' }, '')).rejects.toThrow('UserId é obrigatório')
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
})
