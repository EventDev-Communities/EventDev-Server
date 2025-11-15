import { CurrentUser } from '@common/decorators/current-user.decorator'
import { OwnershipType, RequireOwnership } from '@common/decorators/ownership.decorator'
import { Roles } from '@common/decorators/roles.decorator'
import { UserRole } from '@common/enums/roles.enum'
import { IAuthUser } from '@common/interfaces/auth-user.interface'
import { LoggerService } from '@common/logger/logger.service'
import { CreateEventDto } from '@module/event/dto/createEvent.dto'
import { UpdateEventDto } from '@module/event/dto/updateEvent.dto'
import { EventService } from '@module/event/event.service'
import { Body, Controller, DefaultValuePipe, Delete, Get, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { PublicAccess, VerifySession } from 'supertokens-nestjs'

@ApiTags('events')
@Controller('events')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly logger: LoggerService
  ) {}

  @Post()
  @VerifySession()
  @Roles(UserRole.COMMUNITY)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar novo evento',
    description: 'Cria um novo evento para a comunidade do usuário autenticado'
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Evento criado com sucesso' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Usuário não tem permissão de comunidade' })
  async create(@Body() data: CreateEventDto, @CurrentUser() user: IAuthUser) {
    try {
      this.logger.debug('Creating event', { data, userId: user.id })
      if (!user.communityId) {
        throw new Error('Community ID is required')
      }
      const result = await this.eventService.create(user.communityId, data)
      this.logger.log('Event created successfully', { eventId: result.id })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error('Error creating event', errorMessage)
      throw error
    }
  }

  @Get(':id')
  @PublicAccess()
  @ApiOperation({ summary: 'Buscar evento por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dados do evento' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Evento não encontrado' })
  async getByID(@Param('id', ParseIntPipe) id: number) {
    return await this.eventService.getById(id)
  }

  @Get()
  @PublicAccess()
  @ApiOperation({
    summary: 'Listar todos os eventos',
    description: 'Lista eventos com paginação HATEOAS. Pode filtrar por comunidade, modalidade e status'
  })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 25, description: 'Quantidade de registros' })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0, description: 'Quantidade de registros para pular' })
  @ApiQuery({ name: 'communityId', required: false, type: Number, description: 'Filtrar por ID da comunidade' })
  @ApiQuery({ name: 'modality', required: false, type: String, enum: ['ONLINE', 'PRESENCIAL', 'HIBRIDO'], description: 'Filtrar por modalidade' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filtrar por status ativo/inativo' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de eventos retornada com sucesso com links de navegação' })
  async getAll(
    @Query('take', new DefaultValuePipe(25), ParseIntPipe) take: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('communityId') communityId?: number,
    @Query('modality') modality?: string,
    @Query('isActive') isActive?: boolean,
    @Req() req?: Request
  ) {
    const baseUrl = req ? `${req.protocol}://${req.get('host')}${req.baseUrl}` : '/events'
    return await this.eventService.getAll(take, skip, { communityId, modality, isActive, baseUrl })
  }

  @Patch(':id')
  @VerifySession()
  @RequireOwnership(OwnershipType.EVENT, 'id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar evento',
    description: 'Atualiza um evento existente. Apenas o dono da comunidade pode atualizar seus eventos'
  })
  @ApiQuery({ name: 'idAddress', required: false, type: Number, description: 'ID do endereço (se estiver atualizando)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Evento atualizado com sucesso' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Sem permissão para atualizar este evento' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Evento não encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Query('idAddress', new DefaultValuePipe(null), ParseIntPipe) idAddress: number,
    @Body() data: UpdateEventDto
  ) {
    return await this.eventService.update(id, data, idAddress)
  }

  @Delete(':id')
  @VerifySession()
  @RequireOwnership(OwnershipType.EVENT, 'id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deletar evento',
    description: 'Remove um evento. Apenas o dono da comunidade pode deletar seus eventos'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Evento deletado com sucesso' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Sem permissão para deletar este evento' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Evento não encontrado' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.eventService.delete(id)
  }
}
