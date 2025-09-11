import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'

export enum ModalityEvent {
  ONLINE = 'ONLINE',
  PRESENTIAL = 'PRESENTIAL',
  HYBRID = 'HYBRID'
}

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

  @IsEnum(ModalityEvent)
  modality: ModalityEvent
}
