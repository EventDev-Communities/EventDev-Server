import type { Request } from 'express'
import { LoggerService } from '@common/logger/logger.service'
import { CreateTicketTypeDto } from '@module/ticket/dto/create-ticket-type.dto'
import { UpdateTicketTypeDto } from '@module/ticket/dto/update-ticket-type.dto'
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
}
