import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common'
import { EventService } from './event.service'
import { CreateEventDto } from './dto/createEvent.dto'
import { UpdateEventDto } from './dto/updateEvent.dto'
import { PublicAccess } from 'supertokens-nestjs'

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post(':idCommunity')
  async create(@Param('idCommunity', ParseIntPipe) idCommunity: number, @Body() data: CreateEventDto) {
    return await this.eventService.create(idCommunity, data)
  }

  @Get(':id')
  @PublicAccess()
  async getByID(@Param('id', ParseIntPipe) id: number) {
    return await this.eventService.getById(id)
  }

  @Get('')
  @PublicAccess()
  async getAll(@Query('take', new DefaultValuePipe(5)) take: number, @Query('skip', new DefaultValuePipe(0)) skip: number) {
    return await this.eventService.getAll(take, skip)
  }

  @Patch(':idEvent')
  async update(
    @Param('idEvent', ParseIntPipe) idEvent: number,
    @Query('idAddress', new DefaultValuePipe(null), ParseIntPipe) idAddress: number,
    @Body() data: UpdateEventDto
  ) {
    console.log(idAddress)

    return await this.eventService.update(idEvent, data, idAddress)
  }

  @Delete(':idEvent')
  async delete(@Param('idEvent', ParseIntPipe) idEvent: number) {
    await this.eventService.delete(idEvent)
  }
}
