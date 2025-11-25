import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class InviteCommunityDto {
  @ApiProperty({ example: 'admin@techcommunity.com', description: 'Email do futuro dono da comunidade' })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({ example: 'Tech Community Brasil', description: 'Nome da comunidade' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 'Comunidade focada em tecnologia', required: false })
  @IsString()
  @IsOptional()
  description?: string
}
