import { Type } from 'class-transformer'
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, ValidateNested, IsUrl } from 'class-validator'
import { AddressDto } from '../../address/dto/address.dto'
import { ModalityEvent } from './createEvent.dto'

class EventUpdateData {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsDateString()
  start_date_time?: string

  @IsOptional()
  @IsDateString()
  end_date_time?: string

  @IsOptional()
  @IsEnum(ModalityEvent)
  modality?: ModalityEvent

  @IsOptional()
  @IsUrl()
  link?: string

  @IsOptional()
  @IsString()
  capa_url?: string

  @IsOptional()
  @IsBoolean()
  is_active?: boolean
}

export class UpdateEventDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => EventUpdateData)
  event?: EventUpdateData

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto
}
