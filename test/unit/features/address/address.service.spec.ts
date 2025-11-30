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

  describe('create', () => {
    it('should create an address', async () => {
      const addressDto = {
        streetAddress: 'Street 1',
        number: '123',
        complement: 'Apt 1',
        city: 'City',
        state: 'State',
        cep: '12345678',
        neighborhood: 'Neighborhood'
      }
      const createdAddress = { id: 1, ...addressDto }
      mockRepository.create.mockResolvedValue(createdAddress)

      const result = await service.create(addressDto)

      expect(result).toEqual(createdAddress)
      expect(mockRepository.create).toHaveBeenCalledWith(addressDto)
    })
  })

  describe('update', () => {
    it('should update an address', async () => {
      const partialAddressDto = { street: 'New Street' }
      const idAddress = 1
      const updatedAddress = { id: 1, street: 'New Street' }
      mockRepository.updateMany.mockResolvedValue(updatedAddress)

      const result = await service.update(partialAddressDto, idAddress)

      expect(result).toEqual(updatedAddress)
      expect(mockRepository.updateMany).toHaveBeenCalledWith(partialAddressDto, idAddress)
    })
  })
})
