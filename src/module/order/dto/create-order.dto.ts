import { Type } from 'class-transformer'
import { IsEmail, IsNumber, IsObject, IsOptional, IsString, Min, ValidateNested } from 'class-validator'

class PayerIdentificationDto {
  @IsString()
  type: string

  @IsString()
  number: string
}

export class CreateOrderDto {
  @IsNumber()
  ticketTypeId: number

  @IsNumber()
  @Min(1)
  quantity: number

  @IsString()
  paymentMethodId: string // e.g., 'master', 'visa', 'pix'

  @IsString()
  @IsOptional()
  token?: string // Card token for credit cards

  @IsNumber()
  @IsOptional()
  installments?: number // Number of installments

  @IsString()
  @IsOptional()
  issuerId?: string // Bank issuer ID

  @IsEmail()
  payerEmail: string

  @IsString()
  payerFirstName: string

  @IsString()
  payerLastName: string

  @IsObject()
  @ValidateNested()
  @Type(() => PayerIdentificationDto)
  payerIdentification: PayerIdentificationDto
}
