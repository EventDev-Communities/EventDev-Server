import { AddressDto } from '@module/address/dto/address.dto'
import { ModalityEvent } from '@module/event/dto/create-event.dto'
import { Type } from 'class-transformer'
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator'

class EventUpdateData {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsDateString()
  startDateTime?: string

  @IsOptional()
  @IsDateString()
  endDateTime?: string

  @IsOptional()
  @IsEnum(ModalityEvent)
  modality?: ModalityEvent

  @IsOptional()
  @IsUrl()
  link?: string

  @IsOptional()
  @IsString()
  coverUrl?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
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
