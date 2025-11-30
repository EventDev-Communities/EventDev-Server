import { LoggerService } from '@common/logger/logger.service'
import { AddressController } from '@module/address/address.controller'
import { AddressService } from '@module/address/address.service'
import { AddressDto } from '@module/address/dto/address.dto'
import { Test, TestingModule } from '@nestjs/testing'

describe('AddressController', () => {
  let controller: AddressController
  // let service: AddressService

  const mockAddressService = {
    getAll: jest.fn(),
    create: jest.fn()
  }

  const mockLogger = {
    debug: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressController],
      providers: [
        {
          provide: AddressService,
          useValue: mockAddressService
        },
        {
          provide: LoggerService,
          useValue: mockLogger
        }
      ]
    }).compile()

    controller = module.get<AddressController>(AddressController)
    // service = module.get<AddressService>(AddressService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getAll', () => {
    it('should return all addresses', async () => {
      const result = [{ id: 1, street: 'Street' }]
      mockAddressService.getAll.mockResolvedValue(result)

      expect(await controller.getAll()).toBe(result)
      expect(mockAddressService.getAll).toHaveBeenCalled()
    })
  })

  describe('create', () => {
    it('should create an address', async () => {
      const dto: AddressDto = {
        cep: '12345678',
        state: 'ST',
        city: 'City',
        neighborhood: 'Neighborhood',
        streetAddress: 'Street',
        number: '123'
      }
      const result = { id: 1, ...dto }
      const session = { getUserId: jest.fn().mockReturnValue('user-id') }
      mockAddressService.create.mockResolvedValue(result)

      expect(await controller.create(dto, session as any)).toBe(result)
      expect(mockAddressService.create).toHaveBeenCalledWith(dto)
      expect(mockLogger.debug).toHaveBeenCalled()
    })
  })
})
