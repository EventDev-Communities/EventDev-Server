import type { IAuthUser } from '@common/interfaces/auth-user.interface'
import type { Request } from 'express'
import { CurrentUser } from '@common/decorators/current-user.decorator'
import { LoggerService } from '@common/logger/logger.service'
import { CreateTicketTypeDto } from '@module/ticket/dto/create-ticket-type.dto'
import { UpdateTicketTypeDto } from '@module/ticket/dto/update-ticket-type.dto'
import { TicketService } from '@module/ticket/ticket.service'
import { Body, Controller, DefaultValuePipe, Delete, ForbiddenException, Get, HttpStatus, Inject, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common'
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

  @Post('types')
  @VerifySession()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar novo tipo de ticket',
    description: 'Cria um novo tipo de ticket (produto) para um evento'
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Tipo de ticket criado com sucesso' })
  async createTicketType(@Body() data: CreateTicketTypeDto) {
    try {
      this.logger.debug('Creating ticket type', { eventId: data.eventId, name: data.name })
      const result = await this.ticketService.createTicketType(data)
      this.logger.log('Ticket type created successfully', { ticketTypeId: result.id })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error('Error creating ticket type', errorMessage)
      throw error
    }
  }

  @Get('types/:id')
  @PublicAccess()
  @ApiOperation({ summary: 'Buscar tipo de ticket por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dados do tipo de ticket' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tipo de ticket não encontrado' })
  async getTicketTypeById(@Param('id', ParseIntPipe) id: number) {
    return await this.ticketService.getTicketTypeById(id)
  }

  @Get('event/:eventId/types')
  @PublicAccess()
  @ApiOperation({ summary: 'Listar tipos de tickets de um evento' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de tipos de tickets' })
  async getTicketTypesByEvent(@Param('eventId', ParseIntPipe) eventId: number) {
    return await this.ticketService.getTicketTypesByEvent(eventId)
  }

  @Patch('types/:id')
  @VerifySession()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar tipo de ticket',
    description: 'Atualiza um tipo de ticket existente'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tipo de ticket atualizado com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tipo de ticket não encontrado' })
  async updateTicketType(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateTicketTypeDto
  ) {
    return await this.ticketService.updateTicketType(id, data)
  }

  @Delete('types/:id')
  @VerifySession()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar tipo de ticket' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tipo de ticket deletado com sucesso' })
  async deleteTicketType(@Param('id', ParseIntPipe) id: number) {
    await this.ticketService.deleteTicketType(id)
  }

  // Endpoints para tickets comprados (Legacy/Future)
  @Get()
  @VerifySession()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar tickets comprados',
    description: 'Lista tickets comprados (instâncias) com paginação'
  })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 25 })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'eventId', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  async getAllTickets(
    @Query('take', new DefaultValuePipe(25), ParseIntPipe) take: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('eventId') eventId?: number,
    @Query('userId') userId?: number,
    @Req() req?: Request
  ) {
    const baseUrl = req ? `${req.protocol}://${req.get('host')}${req.baseUrl}` : '/tickets'
    return await this.ticketService.getAllTickets(take, skip, { eventId, userId, baseUrl })
  }

  @Post(':id/check-in')
  @VerifySession()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Realizar Check-in',
    description: 'Valida um ingresso e marca como utilizado. Requer permissão de staff da comunidade.'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Check-in realizado com sucesso' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Ticket inválido ou já utilizado' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Sem permissão para realizar check-in neste evento' })
  async checkIn(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: IAuthUser) {
    // 1. Get ticket to check ownership
    // We need to expose a method in service to get ticket with relations, or trust the service checkIn to handle it?
    // The service checkIn currently doesn't check ownership.
    // Let's do it here for now or delegate to service if we pass the user.

    // Ideally, we should check if the user is a member of the community that owns the event.
    // For MVP, let's assume if the user has COMMUNITY role and is the owner of the community.

    // We need to fetch the ticket first to know the event and community.
    // Since TicketService.checkIn calls getTicketById, we can just call it, but we need to verify permission BEFORE changing status.

    // Let's add a verifyPermission method in TicketService or just fetch it here.
    // Since getTicketById is in repository, let's expose it in Service or use a new method.
    // TicketService has getTicketTypeById but not getTicketById (for Ticket instance).

    // I'll add getTicketById to TicketService first.

    const ticket = await this.ticketService.getTicketById(id)

    // Check if user is the owner of the community
    // Note: ticket.event.communityId is needed.
    // My getTicketById in repo included 'event', but event model in prisma has communityId.

    // We need to check if user.communityId matches ticket.event.communityId
    // But user.communityId in IAuthUser might be null if they are just a participant.
    // If they are a community admin, they should have it.

    // However, a user might own multiple communities or be staff.
    // For MVP, let's check if the user is the owner of the community linked to the event.

    // We need to fetch the community of the event to check ownerId?
    // Or if we trust user.communityId from the token (which represents the "active" community context).

    // Let's assume the user must be logged in as the community that owns the event.
    if (!user.communityId) {
      throw new ForbiddenException('Você precisa estar logado como uma comunidade para realizar check-in')
    }

    // We need to ensure ticket.event.communityId is available.
    // The repository include was: include: { event: true }
    // So ticket.event.communityId should be there.

    if (ticket.event.communityId !== user.communityId) {
      throw new ForbiddenException('Este ingresso não pertence a um evento da sua comunidade')
    }

    return await this.ticketService.checkIn(id, user.id)
  }
}
