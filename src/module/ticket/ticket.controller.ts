import type { IAuthUser } from '@common/interfaces/auth-user.interface'
import type { Request } from 'express'
import { CurrentUser } from '@common/decorators/current-user.decorator'
import { OwnershipType, RequireOwnership } from '@common/decorators/ownership.decorator'
import { Roles } from '@common/decorators/roles.decorator'
import { UserRole } from '@common/enums/roles.enum'
import { LoggerService } from '@common/logger/logger.service'
import { CreateEventDto } from '@module/ticket/dto/createEvent.dto'
import { UpdateEventDto } from '@module/ticket/dto/updateEvent.dto'
import { TicketService } from '@module/ticket/ticket.service'
import { Body, Controller, DefaultValuePipe, Delete, Get, HttpStatus, Inject, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { PublicAccess, VerifySession } from 'supertokens-nestjs'

@ApiTags('tickets')
@Controller('tickets')
export class TicketController {
  constructor(
    @Inject(TicketService)
    private readonly ticketService: TicketService,
    @Inject(LoggerService)
    private readonly logger: LoggerService
  ) {}

  @Post()
  @VerifySession()
  @Roles(UserRole.COMMUNITY)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar novo ticket',
    description: 'Cria um novo tipo de ticket para eventos da comunidade'
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Ticket criado com sucesso' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Usuário não tem permissão de comunidade' })
  async create(@Body() data: CreateEventDto, @CurrentUser() user: IAuthUser) {
    try {
      this.logger.debug('Creating ticket', { data, userId: user.id })
      if (!user.communityId) {
        throw new Error('Community ID is required')
      }
      const result = await this.ticketService.create(user.communityId, data)
      this.logger.log('Ticket created successfully', { ticketId: result.id })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error('Error creating ticket', errorMessage)
      throw error
    }
  }

  @Get(':id')
  @PublicAccess()
  @ApiOperation({ summary: 'Buscar ticket por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dados do ticket' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Ticket não encontrado' })
  async getByID(@Param('id', ParseIntPipe) id: number) {
    return await this.ticketService.getById(id)
  }

  @Get()
  @PublicAccess()
  @ApiOperation({
    summary: 'Listar todos os tickets',
    description: 'Lista tipos de tickets disponíveis com paginação HATEOAS e filtros'
  })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 25, description: 'Quantidade de registros' })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0, description: 'Quantidade de registros para pular' })
  @ApiQuery({ name: 'eventId', required: false, type: Number, description: 'Filtrar por ID do evento' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filtrar por status ativo/inativo' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de tickets retornada com sucesso com links de navegação' })
  async getAll(
    @Query('take', new DefaultValuePipe(25), ParseIntPipe) take: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('eventId') eventId?: number,
    @Query('isActive') isActive?: boolean,
    @Req() req?: Request
  ) {
    const baseUrl = req ? `${req.protocol}://${req.get('host')}${req.baseUrl}` : '/tickets'
    return await this.ticketService.getAll(take, skip, { eventId, isActive, baseUrl })
  }

  @Patch(':id')
  @VerifySession()
  @RequireOwnership(OwnershipType.TICKET, 'id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar ticket',
    description: 'Atualiza um tipo de ticket. Apenas o dono da comunidade pode atualizar'
  })
  @ApiQuery({ name: 'idAddress', required: false, type: Number, description: 'ID do endereço (se aplicável)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Ticket atualizado com sucesso' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Sem permissão para atualizar este ticket' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Ticket não encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Query('idAddress', new DefaultValuePipe(null), ParseIntPipe) idAddress: number,
    @Body() data: UpdateEventDto
  ) {
    return await this.ticketService.update(id, data, idAddress)
  }

  @Delete(':id')
  @VerifySession()
  @RequireOwnership(OwnershipType.TICKET, 'id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deletar ticket',
    description: 'Remove um tipo de ticket. Apenas o dono da comunidade pode deletar'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Ticket deletado com sucesso' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Sem permissão para deletar este ticket' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Ticket não encontrado' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.ticketService.delete(id)
  }
}
