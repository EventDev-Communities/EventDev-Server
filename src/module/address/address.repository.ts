import { AddressDto } from '@module/address/dto/address.dto'
import { PartialAddressDto } from '@module/address/dto/partialAddress.dto'
import { Inject, Injectable } from '@nestjs/common'
import { PrismaService } from '@prisma/prisma.service'

@Injectable()
export class AddressRepository {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

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

  async getAll() {
    return await this.prismaService.address.findMany()
  }
}
