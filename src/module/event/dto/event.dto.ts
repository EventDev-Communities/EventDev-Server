import { modality_event } from "@prisma/client"
import { IsBoolean, IsDate, IsDateString, IsEnum, IsOptional, IsString } from "class-validator"

export class EventDto {
    @IsString()
    link: string

    @IsString()
    description: string

    @IsDateString()
    start_date_time: Date

    @IsDateString()
    end_date_time: Date

    @IsBoolean()
    is_active: boolean

    @IsString()
    title: string
    
    @IsOptional()
    capa_url: string

    @IsEnum(modality_event)
    modality: modality_event
}