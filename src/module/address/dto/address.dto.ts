import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, Matches } from 'class-validator'

export class AddressDto {
  @ApiProperty({ example: '01310100', description: 'CEP (8 dígitos)' })
  @Matches(/^\d{8}$/, { message: 'cep inválido. Deve conter exatamente 8 dígitos numéricos.' })
  cep: string

  @ApiProperty({ example: 'SP', required: false })
  @IsString()
  @IsOptional()
  state: string

  @ApiProperty({ example: 'São Paulo', required: false })
  @IsString()
  @IsOptional()
  city: string

  @ApiProperty({ example: 'Bela Vista', required: false })
  @IsString()
  @IsOptional()
  neighborhood: string

  @ApiProperty({ example: 'Avenida Paulista', required: false })
  @IsString()
  @IsOptional()
  streetAddress: string

  @ApiProperty({ example: '1578', required: false })
  @IsString()
  @IsOptional()
  number: string
}
