import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UserCreateDto } from "./dto/user.dto";

@Injectable()
export class UserRepository {
    constructor(private readonly prismaService: PrismaService) {}

    async getAllUsers() {
        return await this.prismaService.user.findMany();
    }

    async getUserById(id: number) {
        return await this.prismaService.user.findUnique({
            where: { id: id }
        });
    }

    async getUserBySupertokensId(supertokensId: string) {
        return await this.prismaService.user.findUnique({
            where: { supertokens_id: supertokensId }
        });
    }

    async createUser(data: UserCreateDto) {
        return await this.prismaService.user.create({
            data: data
        })
    }
}