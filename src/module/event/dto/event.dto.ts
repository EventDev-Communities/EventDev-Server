import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'

export enum ModalityEvent {
  ONLINE = 'ONLINE',
  PRESENTIAL = 'PRESENTIAL',
  HYBRID = 'HYBRID'
}

export class EventDto {
  @ApiProperty({ example: 'https://meet.google.com/abc-defg-hij', description: 'Link do evento (online) ou informações adicionais' })
  @IsString()
  link: string

  @ApiProperty({ example: 'Workshop de Node.js e TypeScript', description: 'Descrição do evento' })
  @IsString()
  description: string

  @ApiProperty({ example: '2025-12-15T19:00:00Z', description: 'Data e hora de início' })
  @IsDateString()
  startDateTime: Date

  @ApiProperty({ example: '2025-12-15T22:00:00Z', description: 'Data e hora de término' })
  @IsDateString()
  endDateTime: Date

  @ApiProperty({ example: true, default: true })
  @IsBoolean()
  isActive: boolean

  @ApiProperty({ example: 'Workshop de Backend', description: 'Título do evento' })
  @IsString()
  title: string

  @ApiProperty({ example: 'https://example.com/event-banner.jpg', required: false })
  @IsOptional()
  coverUrl: string

  @ApiProperty({ example: 'ONLINE', enum: ModalityEvent, description: 'Modalidade do evento' })
  @IsEnum(ModalityEvent)
  modality: ModalityEvent

  @ApiProperty({ example: 1, required: false, description: 'ID do endereço (para eventos presenciais)' })
  @IsOptional()
  @IsNumber()
  addressId?: number
}
