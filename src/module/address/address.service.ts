import { LoggerService } from '@common/logger/logger.service'
import { AddressRepository } from '@module/address/address.repository'
import { AddressDto } from '@module/address/dto/address.dto'
import { PartialAddressDto } from '@module/address/dto/partial-address.dto'
import { Inject, Injectable } from '@nestjs/common'

@Injectable()
export class AddressService {
  constructor(
    @Inject(AddressRepository) private readonly addressRepository: AddressRepository,
    @Inject(LoggerService) private readonly logger: LoggerService) {
    this.logger.log('[AddressService] constructed')
  }

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
