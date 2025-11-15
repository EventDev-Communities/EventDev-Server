import { AddressController } from '@module/address/address.controller'
import { AddressRepository } from '@module/address/address.repository'
import { AddressService } from '@module/address/address.service'
import { Module } from '@nestjs/common'

@Module({
  controllers: [AddressController],
  providers: [AddressRepository, AddressService],
  exports: [AddressService]
})
export class AddressModule {}
