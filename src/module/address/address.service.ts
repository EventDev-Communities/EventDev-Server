import { AddressRepository } from '@module/address/address.repository'
import { AddressDto } from '@module/address/dto/address.dto'
import { PartialAddressDto } from '@module/address/dto/partialAddress.dto'
import { Inject, Injectable } from '@nestjs/common'

@Injectable()
export class AddressService {
  constructor(@Inject(AddressRepository) private readonly addressRepository: AddressRepository) {}

  async create(address: AddressDto) {
    return await this.addressRepository.create(address)
  }

  async update(address: PartialAddressDto, idAddress: number) {
    return await this.addressRepository.updateMany(address, idAddress)
  }

  async getAll() {
    return await this.addressRepository.getAll()
  }
}
