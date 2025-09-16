import { IsString, Matches, IsOptional } from 'class-validator'

export class AddressDto {
  @Matches(/^\d{8}$/, { message: 'cep inválido. Deve conter exatamente 8 dígitos numéricos.' })
  cep: string

  @IsString()
  @IsOptional()
  state: string

  @IsString()
  @IsOptional()
  city: string

  @IsString()
  @IsOptional()
  neighborhood: string

  @IsString()
  @IsOptional()
  streetAddress: string

  @IsString()
  @IsOptional()
  number: string
}
