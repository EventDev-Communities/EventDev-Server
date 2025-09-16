import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { CommunityService } from './community.service'
import { UpdateCommunityDto } from './dto/updateCommunity.dto'
import { CreateCommunityDto } from './dto/createCommunity.dto'
import { PublicAccess, VerifySession, Session } from 'supertokens-nestjs'
import { SessionContainer } from 'supertokens-node/recipe/session'

/*
 *
 * TODA E QUALQUER ROTA ESTARÁ PROTEGIDA (PRECISA LOGAR), SE QUISER QUE UMA ROTA
 * SEJA ACESSÍVEL PARA TODOS, ADICIONE O DECORADOR @PublicAccess DO supertokens-nestjs
 * (import { PublicAccess } from "supertokens-nestjs";)
 *
 */

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) { }

  @Get()
  @PublicAccess()
  async getAll(
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number
  ) {
    return await this.communityService.getAll(take, skip)
  }

  @Get('my-community')
  @VerifySession()
  async getMyCommunity(@Session() session: SessionContainer) {
    return await this.communityService.getByUserId(session.getUserId())
  }

  @Post()
  @VerifySession()
  async create(@Body() data: CreateCommunityDto, @Session() session: SessionContainer) {
    console.log('=== COMMUNITY CONTROLLER CREATE ===')
    console.log('Session getUserId():', session.getUserId())
    console.log('Data recebida:', data)
    console.log('===================================')
    return await this.communityService.create(data, session.getUserId())
  }

  @Get(':id')
  @PublicAccess()
  async getByID(@Param('id', ParseIntPipe) id: number) {
    return await this.communityService.getByID(id)
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateCommunityDto) {
    return await this.communityService.update(id, data)
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.communityService.delete(id)
  }
}
