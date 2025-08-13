import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AddressDto } from "./dto/address.dto";

@Injectable()
export class AddressRepository {
    constructor(private readonly prismaService: PrismaService) {}

    async create(data: AddressDto) {
        return await this.prismaService.address.create({data});
    }
}   