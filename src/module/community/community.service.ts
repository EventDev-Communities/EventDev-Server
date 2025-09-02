import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { CommunityRepository } from "./community.repository";
import { UpdateCommunityDto } from "./dto/updateCommunity.dto";
import { CreateCommunityDto } from "./dto/createCommunity.dto";

@Injectable()
export class CommunityService {
  constructor(private readonly communityRepository: CommunityRepository) {}

  async getAll(take: number, skip: number) {
    return await this.communityRepository.getAll(take, skip)
  }

    async create(data: CreateCommunityDto) {
        const user = await this.communityRepository.create(data);
        return user;
    }

  async getByID(id: number) {
    await this.isExistCommunity(id)
    return await this.communityRepository.getByID(id)
  }

    async isExistCommunity(id: number) {
        if(!await this.communityRepository.getByID(id)) throw new NotFoundException('Comunidade não encontrada');
    }

    async update(id: number, data: UpdateCommunityDto) {
        await this.isExistCommunity(id);
        return await this.communityRepository.update(id, data);
    }

    async delete(id: number) {
        await this.isExistCommunity(id);
        await this.communityRepository.delete(id);
    }
}
