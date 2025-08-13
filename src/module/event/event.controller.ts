import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from "@nestjs/common";
import { EventService } from "./event.service";
import { CreateCommunityDto } from "../community/dto/createCommunity.dto";
import { skip } from "node:test";
import { CreateEventDto } from "./dto/createEvent.dto";
import { UpdateEventDto } from "./dto/updateEvent.dto";

@Controller('event')
export class EventController {
    constructor(private readonly eventService: EventService) {}

    @Post(':IdCommunity')
    async create (@Param('IdCommunity', ParseIntPipe) idCommunity: number, @Body() data: CreateEventDto) {
        return await this.eventService.create(idCommunity, data);
    }

    @Get(':id')
    async getByID(@Param('id', ParseIntPipe) id: number) {
        return await this.eventService.getById(id);
    }

    @Get('')
    async getAll(@Query('take', new DefaultValuePipe(5)) take: number, @Query('skip', new DefaultValuePipe(0)) skip: number) {
        return await this.eventService.getAll(take, skip);
    }

    @Patch(':idEvent')
    async update(@Param('idEvent', ParseIntPipe) idEvent: number, @Body() data: UpdateEventDto) {
        return await this.eventService.update(idEvent, data);
    }

    @Delete(':idEvent')
    async delete (@Param('idEvent', ParseIntPipe) idEvent: number) {
        await this.eventService.delete(idEvent);
    }
}