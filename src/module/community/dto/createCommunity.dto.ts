import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator'

export class CreateCommunityDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsOptional()
  @IsUrl({}, { message: 'A URL do logo é inválida.' })
  logo_url?: string

  @IsString()
  @IsOptional()
  phone_number?: string

  @IsUrl()
  @IsOptional()
  link_instagram?: string

  @IsUrl()
  @IsOptional()
  link_linkedin?: string

  @IsUrl()
  @IsOptional()
  link_website?: string

  @IsUrl()
  @IsOptional()
  link_github?: string

  @IsBoolean()
  @IsOptional()
  is_active?: boolean
}
