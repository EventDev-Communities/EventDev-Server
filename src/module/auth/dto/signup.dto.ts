import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, IsStrongPassword, IsUrl } from 'class-validator'

export class CommunitySignUpDto {
  @ApiProperty({ example: 'community@example.com', description: 'Email da comunidade' })
  @IsEmail({}, { message: 'O email informado é inválido.' })
  @IsNotEmpty({ message: 'O email não pode estar vazio.' })
  email: string

  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  @IsStrongPassword(
    { minLength: 8, minUppercase: 1, minSymbols: 1 },
    { message: 'A senha deve ter no mínimo 8 caracteres, uma letra maiúscula e um símbolo.' }
  )
  password: string

  @ApiProperty({ example: 'Tech Community Brasil', description: 'Nome da comunidade' })
  @IsString()
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
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
  @IsUrl({}, { message: 'O link do Instagram é inválido.' })
  @IsOptional()
  instagramLink?: string

  @ApiProperty({ example: 'https://linkedin.com/company/techcommunity', required: false })
  @IsUrl({}, { message: 'O link do LinkedIn é inválido.' })
  @IsOptional()
  linkedinLink?: string

  @ApiProperty({ example: 'https://techcommunity.dev', required: false })
  @IsUrl({}, { message: 'O link do website é inválido.' })
  @IsOptional()
  websiteLink?: string

  @ApiProperty({ example: 'https://github.com/techcommunity', required: false })
  @IsUrl({}, { message: 'O link do GitHub é inválido.' })
  @IsOptional()
  githubLink?: string

  @ApiProperty({ example: 'community', enum: ['user', 'community'], description: 'Tipo de conta' })
  @IsString()
  @IsIn(['user', 'community'], { message: 'O papel (role) informado é inválido.' })
  role: 'user' | 'community'

  isActive: boolean
}

export class UserSignUpDto {
  @IsEmail({}, { message: 'O email informado é inválido.' })
  @IsNotEmpty({ message: 'O email não pode estar vazio.' })
  email: string

  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  @IsStrongPassword(
    { minLength: 8, minUppercase: 1, minSymbols: 1 },
    { message: 'A senha deve ter no mínimo 8 caracteres, uma letra maiúscula e um símbolo.' }
  )
  password: string

  @IsString()
  @IsIn(['user', 'community'], { message: 'O papel (role) informado é inválido.' })
  role: 'user' | 'community'

  is_active: boolean
}
