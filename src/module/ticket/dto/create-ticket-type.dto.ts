import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class CreateTicketTypeDto {
  @IsInt()
  @IsNotEmpty()
  eventId: number

  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number

  @IsInt()
  @Min(0)
  quantity: number

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
