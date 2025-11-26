import { CreateTicketTypeDto } from '@module/ticket/dto/create-ticket-type.dto'
import { PartialType } from '@nestjs/mapped-types'

export class UpdateTicketTypeDto extends PartialType(CreateTicketTypeDto) {}
