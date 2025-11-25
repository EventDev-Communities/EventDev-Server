import { LoggerService } from '@common/logger/logger.service'
import { AddressRepository } from '@module/address/address.repository'
import { AddressService } from '@module/address/address.service'
import { Test, TestingModule } from '@nestjs/testing'

describe('AddressService', () => {
  let service: AddressService

  const mockRepository = {
    create: jest.fn(),
    updateMany: jest.fn(),
    getAll: jest.fn()
  }

  const mockLogger = {
    log: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressService,
        { provide: AddressRepository, useValue: mockRepository },
        { provide: LoggerService, useValue: mockLogger }
      ]
    }).compile()

    service = module.get<AddressService>(AddressService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getAll', () => {
    it('should return all addresses', async () => {
      const mockAddresses = [
        { id: 1, streetAddress: 'Street 1' },
        { id: 2, streetAddress: 'Street 2' }
      ]
      mockRepository.getAll.mockResolvedValue(mockAddresses)

      const result = await service.getAll()

      expect(result).toMatchSnapshot()
      expect(mockRepository.getAll).toHaveBeenCalled()
    })
  })
})
