import { PrismaService } from '@db/prisma.service'
import { AppService } from '@module/app/app.service'
import { Test, TestingModule } from '@nestjs/testing'

describe('AppService', () => {
  let service: AppService
  // let prismaService: PrismaService

  const mockPrismaService = {
    $connect: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: PrismaService, useValue: mockPrismaService }
      ]
    }).compile()

    service = module.get<AppService>(AppService)
    // prismaService = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getApiStats', () => {
    it('should return api stats', () => {
      expect(service.getApiStats()).toEqual({ status: 'online', api: 'eventdev-api', version: 'v1' })
    })
  })

  describe('getHealth', () => {
    it('should return database ok when connection succeeds', async () => {
      mockPrismaService.$connect.mockResolvedValue(undefined)
      const result = await service.getHealth()
      expect(result).toEqual({ status: 'database ok' })
    })

    it('should return database error when connection fails', async () => {
      mockPrismaService.$connect.mockRejectedValue(new Error('Connection failed'))
      const result = await service.getHealth()
      expect(result).toEqual({ status: 'database error' })
    })
  })
})
