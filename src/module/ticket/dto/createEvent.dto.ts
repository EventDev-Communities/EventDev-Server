import { AddressDto } from '@module/address/dto/address.dto'
import { Type } from 'class-transformer'
import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator'

export enum ModalityEvent {
  ONLINE = 'ONLINE',
  PRESENTIAL = 'PRESENTIAL',
  HYBRID = 'HYBRID'
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: 'Título é obrigatório' })
  title: string

  @IsString()
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  description: string

  @IsDateString({}, { message: 'Data de início deve ser uma data válida' })
  startDateTime: string

  @IsDateString({}, { message: 'Data de fim deve ser uma data válida' })
  endDateTime: string

  @IsEnum(ModalityEvent, { message: 'Modalidade deve ser ONLINE, PRESENTIAL ou HYBRID' })
  modality: ModalityEvent

  @IsOptional()
  @IsUrl({}, { message: 'Link deve ser uma URL válida' })
  link?: string

  @IsOptional()
  @IsString()
  coverUrl?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto
}
