import { modality_event } from "@prisma/client"
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from "class-validator"

export class UpdateEventDto {
    @IsString()
    @IsOptional()
    link?: string

    @IsString()
    @IsOptional()
    description?: string

    @IsDateString()
    @IsOptional()
    start_date_time?: Date

    @IsDateString()
    @IsOptional()
    end_date_time?: Date

    @IsBoolean()
    @IsOptional()
    is_active?: boolean

    @IsString()
    @IsOptional()
    title?: string
    
    @IsOptional()
    @IsOptional()
    capa_url?: string

    @IsEnum(modality_event)
    @IsOptional()
    modality?: modality_event
}