import { IsEmail, IsNotEmpty, IsStrongPassword, IsOptional, IsString, IsUrl, IsIn } from 'class-validator'

export class CommunitySignUpDto {
  @IsEmail({}, { message: 'O email informado é inválido.' })
  @IsNotEmpty({ message: 'O email não pode estar vazio.' })
  email: string

  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  @IsStrongPassword(
    { minLength: 8, minUppercase: 1, minSymbols: 1 },
    { message: 'A senha deve ter no mínimo 8 caracteres, uma letra maiúscula e um símbolo.' }
  )
  password: string
}

export class UserSignUpDto {}
