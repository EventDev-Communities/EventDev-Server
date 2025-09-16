import { Injectable } from '@nestjs/common'
import { AddressDto } from './dto/address.dto'
import { AddressRepository } from './address.repository'
import { PartialAddressDto } from '../event/dto/updateEvent.dto'

@Injectable()
export class AddressService {
  constructor(private readonly addressRepository: AddressRepository) {}

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
