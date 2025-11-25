import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class ResetPasswordDto {
  @ApiProperty({ example: 'token-xyz-123', description: 'Token de redefinição de senha recebido por email' })
  @IsString()
  @IsNotEmpty({ message: 'Token é obrigatório' })
  token: string

  @ApiProperty({ example: 'NewPassword123!', description: 'Nova senha do usuário' })
  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  password: string
}
