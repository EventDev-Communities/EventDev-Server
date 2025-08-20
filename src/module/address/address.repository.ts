import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { AddressDto } from './dto/address.dto'
import { PartialAddressDto } from '../event/dto/updateEvent.dto'

@Injectable()
export class AddressRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: AddressDto) {
    return await this.prismaService.address.create({ data })
  }

  async updateMany(data: PartialAddressDto, idAddress: number) {
    return await this.prismaService.address.updateMany({
      where: {
        id: idAddress
      },
      data
    })
  }

  async findById(idAddress: number) {
    return await this.prismaService.address.findUnique({
      where: { id: idAddress }
    })
  }
}
