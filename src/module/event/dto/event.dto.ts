import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'

export enum ModalityEvent {
  ONLINE = 'ONLINE',
  PRESENTIAL = 'PRESENTIAL',
  HYBRID = 'HYBRID'
}

export class EventDto {
  @IsString()
  name: string // mudado de title

  @IsString()
  description: string

  @IsDateString()
  data_hora_inicial: Date // mudado de start_date_time

  @IsDateString()
  data_hora_final: Date // mudado de end_date_time

  @IsString()
  @IsOptional()
  link: string = '' // tornar opcional com valor padrão vazio

  @IsBoolean()
  @IsOptional()
  is_active: boolean = true // tornar opcional com valor padrão true

  @IsOptional()
  banner_url: string = '' // mudado de capa_url

  @IsEnum(ModalityEvent)
  modalidade: ModalityEvent // mudado de modality
}