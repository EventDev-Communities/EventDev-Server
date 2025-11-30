import { LoggerService } from '@common/logger/logger.service'
import { PrismaService } from '@db/prisma.service'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

jest.mock('pg', () => {
  const mPool = {
    end: jest.fn()
  }
  return { Pool: jest.fn(() => mPool) }
})

jest.mock('@prisma/adapter-pg', () => {
  return { PrismaPg: jest.fn() }
})

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      async $connect() {}
      async $disconnect() {}
    },
    Prisma: {
      PrismaClientOptions: {}
    }
  }
})

jest.mock('@configs/env', () => ({
  env: jest.fn().mockReturnValue({ DATABASE_URL: 'postgres://localhost:5439/db' })
}))

describe('PrismaService', () => {
  let service: PrismaService
  let pool: Pool

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        { provide: LoggerService, useValue: mockLogger }
      ]
    }).compile()

    service = module.get<PrismaService>(PrismaService)
    pool = (service as any).pool
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(Pool).toHaveBeenCalled()
    expect(PrismaPg).toHaveBeenCalled()
  })

  describe('onModuleInit', () => {
    it('should connect to database', async () => {
      const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue(undefined)
      await service.onModuleInit()
      expect(connectSpy).toHaveBeenCalled()
      expect(mockLogger.log).toHaveBeenCalledWith('Connecting to database...')
    })
  })

  describe('onModuleDestroy', () => {
    it('should disconnect from database and close pool', async () => {
      const disconnectSpy = jest.spyOn(service, '$disconnect').mockResolvedValue(undefined)
      const poolEndSpy = (pool.end as jest.Mock).mockResolvedValue(undefined)

      await service.onModuleDestroy()

      expect(disconnectSpy).toHaveBeenCalled()
      expect(poolEndSpy).toHaveBeenCalled()
    })

    it('should log error if pool.end() fails', async () => {
      const disconnectSpy = jest.spyOn(service, '$disconnect').mockResolvedValue(undefined)
      const error = new Error('Pool error')
      const poolEndSpy = (pool.end as jest.Mock).mockRejectedValue(error)

      await service.onModuleDestroy()

      expect(disconnectSpy).toHaveBeenCalled()
      expect(poolEndSpy).toHaveBeenCalled()
      expect(mockLogger.error).toHaveBeenCalledWith('Error closing pool', error.stack)
    })

    it('should log string error if pool.end() fails with non-Error', async () => {
      const disconnectSpy = jest.spyOn(service, '$disconnect').mockResolvedValue(undefined)
      const error = 'Pool error string'
      const poolEndSpy = (pool.end as jest.Mock).mockRejectedValue(error)

      await service.onModuleDestroy()

      expect(disconnectSpy).toHaveBeenCalled()
      expect(poolEndSpy).toHaveBeenCalled()
      expect(mockLogger.error).toHaveBeenCalledWith('Error closing pool', error)
    })
  })
})
