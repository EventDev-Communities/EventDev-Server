import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator'

export class AcceptInviteDto {
  @ApiProperty({ description: 'Token de convite recebido por email' })
  @IsString()
  @IsNotEmpty()
  token: string

  @ApiProperty({ example: 'StrongP@ssw0rd!', description: 'Senha para a nova conta' })
  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  @IsStrongPassword(
    { minLength: 8, minUppercase: 1, minSymbols: 1 },
    { message: 'A senha deve ter no mínimo 8 caracteres, uma letra maiúscula e um símbolo.' }
  )
  password: string
}
