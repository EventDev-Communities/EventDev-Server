import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { CommunityService } from './community.service'
import { UpdateCommunityDto } from './dto/updateCommunity.dto'
import { CreateCommunityDto } from './dto/createCommunity.dto'
import { PublicAccess, Session, VerifySession } from 'supertokens-nestjs'
import { SessionContainer } from 'supertokens-node/recipe/session'
import { deleteUser } from 'supertokens-node'
// import { Prisma } from '@prisma/client'

/*
 *
 * TODA E QUALQUER ROTA ESTARÁ PROTEGIDA (PRECISA LOGAR), SE QUISER QUE UMA ROTA
 * SEJA ACESSÍVEL PARA TODOS, ADICIONE O DECORADOR @PublicAccess DO supertokens-nestjs
 * (import { PublicAccess } from "supertokens-nestjs";)
 *
 */

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  @PublicAccess()
  async getAll(
    @Query('take', new DefaultValuePipe(5), ParseIntPipe) take: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number
  ) {
    return await this.communityService.getAll(take, skip);
  }

  @Post()
  @VerifySession({roles: ["admin"]})
  async create(@Body() data: CreateCommunityDto) {
    return await this.communityService.create(data);
  }

  @Get(':id')
  @PublicAccess()
  async getByID(@Param('id', ParseIntPipe) id: number) {
    return await this.communityService.getByID(id);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateCommunityDto) {
    return await this.communityService.update(id, data);
  }

  @Delete()
  async deleteSelf(@Session() session: SessionContainer) {
    try {
      await this.communityService.deleteSelf(session.getUserId());
      await session.revokeSession();
      await deleteUser(session.getUserId(), true);
      return { status: "OK" };
    } catch (err) {
      throw err      
    }
  }

  @Delete(':supertokens_id')
  @VerifySession({roles: ["admin"]})
  async deleteById(@Param('supertokens_id') supertokensId: string) {
    try {
      await this.communityService.deleteById(supertokensId);
      await deleteUser(supertokensId, true);
      return { status: "OK" }
    } catch (err) {
      throw err      
    }
  }
}
