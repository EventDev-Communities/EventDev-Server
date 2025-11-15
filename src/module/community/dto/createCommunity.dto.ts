import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator'

export class CreateCommunityDto {
  @ApiProperty({ example: 'Tech Community Brasil', description: 'Nome da comunidade' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 'Comunidade focada em tecnologia', required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ example: 'https://example.com/logo.png', required: false })
  @IsOptional()
  @IsUrl({}, { message: 'A URL do logo é inválida.' })
  logoUrl?: string

  @ApiProperty({ example: '11987654321', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string

  @ApiProperty({ example: 'https://instagram.com/techcommunity', required: false })
  @IsUrl()
  @IsOptional()
  instagramLink?: string

  @ApiProperty({ example: 'https://linkedin.com/company/techcommunity', required: false })
  @IsUrl()
  @IsOptional()
  linkedinLink?: string

  @ApiProperty({ example: 'https://techcommunity.dev', required: false })
  @IsUrl()
  @IsOptional()
  websiteLink?: string

  @ApiProperty({ example: 'https://github.com/techcommunity', required: false })
  @IsUrl()
  @IsOptional()
  githubLink?: string

  @ApiProperty({ example: true, required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
