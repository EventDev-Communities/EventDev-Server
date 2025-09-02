import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignInDto {
  @IsEmail({}, { message: 'O email informado é inválido.' })
  @IsNotEmpty({ message: 'O email não pode estar vazio.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  password: string;
}
