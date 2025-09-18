import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator'

export class UpdateCommunityDto {
  @IsOptional()
  @IsUrl()
  logo_url?: string;

  @IsOptional()
  @IsUrl()
  link_instagram?: string;

  @IsOptional()
  @IsUrl()
  link_linkedin?: string;

  @IsOptional()
  @IsUrl()
  link_website?: string;

  @IsOptional()
  @IsUrl()
  link_github?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;
}
