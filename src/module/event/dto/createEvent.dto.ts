import { modality_event } from "@prisma/client"
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator"
import { EventDto } from "./event.dto"
import { AddressDto } from "../../address/dto/address.dto"
import { Type } from "class-transformer"

export class CreateEventDto {
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => EventDto)
    event: EventDto

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => AddressDto)
    address: AddressDto
}