import { PrismaService } from '@db/prisma.service'
import { AddressRepository } from '@module/address/address.repository'
import { AddressDto } from '@module/address/dto/address.dto'
import { PartialAddressDto } from '@module/address/dto/partial-address.dto'
import { Test, TestingModule } from '@nestjs/testing'

const mockPrismaService = {
  address: {
    create: jest.fn(),
    updateMany: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn()
  }
}

describe('AddressRepository', () => {
  let repository: AddressRepository
  // let prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressRepository,
        { provide: PrismaService, useValue: mockPrismaService }
      ]
    }).compile()

    repository = module.get<AddressRepository>(AddressRepository)
    // prismaService = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(repository).toBeDefined()
  })

  describe('create', () => {
    it('should create an address', async () => {
      const data: AddressDto = {
        cep: '01310100',
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Bela Vista',
        streetAddress: 'Avenida Paulista',
        number: '1578'
      }
      const result = { id: 1, ...data, createdAt: new Date(), updatedAt: new Date(), complement: null }
      mockPrismaService.address.create.mockResolvedValue(result)

      expect(await repository.create(data)).toEqual(result)
      expect(mockPrismaService.address.create).toHaveBeenCalledWith({ data })
    })
  })

  describe('updateMany', () => {
    it('should update addresses', async () => {
      const data: PartialAddressDto = {
        street: 'New Street',
        city: 'New City'
      }
      const idAddress = 1
      const result = { count: 1 }
      mockPrismaService.address.updateMany.mockResolvedValue(result)

      expect(await repository.updateMany(data, idAddress)).toEqual(result)
      expect(mockPrismaService.address.updateMany).toHaveBeenCalledWith({
        where: { id: idAddress },
        data
      })
    })
  })

  describe('findById', () => {
    it('should find an address by id', async () => {
      const idAddress = 1
      const result = { id: 1, cep: '00000000', state: 'SP', city: 'City', neighborhood: 'Hood', streetAddress: 'Street', number: '123', complement: null, createdAt: new Date(), updatedAt: new Date() }
      mockPrismaService.address.findUnique.mockResolvedValue(result)

      expect(await repository.findById(idAddress)).toEqual(result)
      expect(mockPrismaService.address.findUnique).toHaveBeenCalledWith({
        where: { id: idAddress }
      })
    })
  })

  describe('getAll', () => {
    it('should return all addresses', async () => {
      const result = [{ id: 1, cep: '00000000' }]
      mockPrismaService.address.findMany.mockResolvedValue(result)

      expect(await repository.getAll()).toEqual(result)
      expect(mockPrismaService.address.findMany).toHaveBeenCalled()
    })
  })
})
