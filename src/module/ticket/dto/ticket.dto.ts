import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'

export enum ModalityEvent {
  ONLINE = 'ONLINE',
  PRESENTIAL = 'PRESENTIAL',
  HYBRID = 'HYBRID'
}

export class TicketDto {
  @IsString()
  link: string

  @IsString()
  description: string

  @IsDateString()
  startDateTime: Date

  @IsDateString()
  endDateTime: Date

  @IsBoolean()
  isActive: boolean

  @IsString()
  title: string

  @IsOptional()
  coverUrl: string

  @IsEnum(ModalityEvent)
  modality: ModalityEvent

  @IsOptional()
  @IsNumber()
  addressId?: number
}
