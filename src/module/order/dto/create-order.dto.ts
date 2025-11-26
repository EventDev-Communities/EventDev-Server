import { IsEmail, IsNumber, IsOptional, IsString, Min } from 'class-validator'

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
}
