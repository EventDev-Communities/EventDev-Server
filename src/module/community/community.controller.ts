import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common";
import { CommunityService } from "./community.service";
import { UpdateCommunityDto } from "./dto/updateCommunity.dto";
import { Prisma } from "@prisma/client";

/*
 * TODA E QUALQUER ROTA ESTARÁ PROTEGIDA (PRECISA LOGAR), SE QUISER QUE UMA ROTA SEJA ACESSIVEL
 * PARA TODOS, ADICIONE O DECORADOR @PublicAccess DO supertokens-nestjs
 * (import { PublicAccess } from "supertokens-nestjs";)
 * */

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  async getAll(@Query('take', new DefaultValuePipe(5), ParseIntPipe) take: number, @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number) {
    return await this.communityService.getAll(take, skip);
  }

  @Post()
  async create(@Body() data: Prisma.communityCreateInput) {
    return await this.communityService.create(data);
  }

  @Get(':id')
  async getByID(@Param('id', ParseIntPipe) id: number) {
    return await this.communityService.getByID(id);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateCommunityDto) {
    return await this.communityService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.communityService.delete(id);
  }
}
