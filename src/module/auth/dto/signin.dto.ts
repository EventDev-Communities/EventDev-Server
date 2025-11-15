import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class SignInDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email do usuário' })
  @IsEmail({}, { message: 'O email informado é inválido.' })
  @IsNotEmpty({ message: 'O email não pode estar vazio.' })
  email: string

  @ApiProperty({ example: 'Password@123', description: 'Senha do usuário' })
  @IsString({ message: 'A senha deve ser string' })
  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  password: string
}
