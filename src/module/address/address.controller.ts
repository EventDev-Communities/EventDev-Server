import { Controller, Get, Post, Body } from '@nestjs/common'
import { AddressService } from './address.service'
import { AddressDto } from './dto/address.dto'
import { PublicAccess, VerifySession, Session } from 'supertokens-nestjs'
import { SessionContainer } from 'supertokens-node/recipe/session'

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @PublicAccess()
  async getAll() {
    return await this.addressService.getAll()
  }

  @Post()
  @VerifySession()
  async create(@Body() data: AddressDto, @Session() session: SessionContainer) {
    console.log('=== ADDRESS CONTROLLER CREATE ===')
    console.log('Session getUserId():', session.getUserId())
    console.log('Data recebida:', data)
    console.log('==================================')
    return await this.addressService.create(data)
  }
}
