import { Type } from 'class-transformer'
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, ValidateNested, IsUrl, IsNotEmpty } from 'class-validator'
import { AddressDto } from '../../address/dto/address.dto'

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
  start_date_time: string

  @IsDateString({}, { message: 'Data de fim deve ser uma data válida' })
  end_date_time: string

  @IsEnum(ModalityEvent, { message: 'Modalidade deve ser ONLINE, PRESENTIAL ou HYBRID' })
  modality: ModalityEvent

  @IsOptional()
  @IsUrl({}, { message: 'Link deve ser uma URL válida' })
  link?: string

  @IsOptional()
  @IsString()
  capa_url?: string

  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto
}
