import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator'

export class CreateCommunityDto {
  @IsNotEmpty()
  @IsString()
  supertokens_id: string;

  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  logo_url: string

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
  is_active: boolean
}
