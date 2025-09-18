import { IsOptional, IsString } from 'class-validator'

export class PartialAddressDto {
  @IsOptional()
  @IsString()
  street?: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  state?: string

  @IsOptional()
  @IsString()
  zip?: string

  @IsOptional()
  @IsString()
  number?: string
}
