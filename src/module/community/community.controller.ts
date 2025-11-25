import type { IAuthUser } from '@common/interfaces/auth-user.interface'
import type { Request } from 'express'
import { CurrentUser } from '@common/decorators/current-user.decorator'
import { OwnershipType, RequireOwnership } from '@common/decorators/ownership.decorator'
import { Roles } from '@common/decorators/roles.decorator'
import { UserRole } from '@common/enums/roles.enum'
import { CommunityService } from '@module/community/community.service'
import { CreateCommunityDto } from '@module/community/dto/createCommunity.dto'
import { InviteCommunityDto } from '@module/community/dto/inviteCommunity.dto'
import { UpdateCommunityDto } from '@module/community/dto/updateCommunity.dto'
import { Body, Controller, DefaultValuePipe, Delete, Get, HttpStatus, Inject, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { PublicAccess, VerifySession } from 'supertokens-nestjs'

@ApiTags('communities')
@Controller('communities')
export class CommunityController {
  constructor(@Inject(CommunityService) private readonly communityService: CommunityService) {}

  @Get()
  @PublicAccess()
  @ApiOperation({
    summary: 'Listar todas as comunidades',
    description: 'Lista comunidades ativas com paginação HATEOAS e filtros'
  })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 20, description: 'Quantidade de registros' })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0, description: 'Quantidade de registros para pular' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filtrar por status ativo/inativo' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nome ou descrição' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de comunidades retornada com sucesso com links de navegação' })
  async getAll(
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('isActive') isActive?: boolean,
    @Query('search') search?: string,
    @Req() req?: Request
  ) {
    const baseUrl = req ? `${req.protocol}://${req.get('host')}${req.baseUrl}` : '/communities'
    return await this.communityService.getAll(take, skip, { isActive, search, baseUrl })
  }

  @Get('me')
  @VerifySession()
  @Roles(UserRole.COMMUNITY)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obter minha comunidade',
    description: 'Retorna os dados da comunidade do usuário autenticado'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dados da comunidade retornados com sucesso' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Usuário não tem perfil de comunidade' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Comunidade não encontrada' })
  async getMyCommunity(@CurrentUser() user: IAuthUser) {
    return await this.communityService.getByUserId(user.id)
  }

  @Post()
  @VerifySession()
  @Roles(UserRole.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar nova comunidade',
    description: 'Cria uma nova comunidade. Restrito a administradores da plataforma.'
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Comunidade criada com sucesso' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Usuário não tem permissão para criar comunidade' })
  async create(@Body() data: CreateCommunityDto) {
    return await this.communityService.create(data, data.ownerId)
  }

  @Get(':id')
  @PublicAccess()
  @ApiOperation({ summary: 'Buscar comunidade por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dados da comunidade' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Comunidade não encontrada' })
  async getByID(@Param('id', ParseIntPipe) id: number) {
    return await this.communityService.getByID(id)
  }

  @Patch(':id')
  @VerifySession()
  @RequireOwnership(OwnershipType.COMMUNITY, 'id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar comunidade',
    description: 'Atualiza os dados da comunidade. Apenas o dono pode atualizar'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Comunidade atualizada com sucesso' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Sem permissão para atualizar esta comunidade' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Comunidade não encontrada' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateCommunityDto) {
    return await this.communityService.update(id, data)
  }

  @Delete(':id')
  @VerifySession()
  @RequireOwnership(OwnershipType.COMMUNITY, 'id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deletar comunidade',
    description: 'Remove uma comunidade. Apenas o dono pode deletar'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Comunidade deletada com sucesso' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Sem permissão para deletar esta comunidade' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Comunidade não encontrada' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.communityService.delete(id)
  }

  @Post('invite')
  @VerifySession()
  @Roles(UserRole.PLATFORM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Convidar comunidade',
    description: 'Envia um convite por email para criar uma nova comunidade.'
  })
  async invite(@Body() data: InviteCommunityDto) {
    return await this.communityService.invite(data)
  }

  @Get('invite/:token')
  @PublicAccess()
  @ApiOperation({
    summary: 'Validar convite',
    description: 'Verifica se o token de convite é válido e retorna os dados.'
  })
  async validateInvite(@Param('token') token: string) {
    return await this.communityService.validateInvitation(token)
  }
}
