import { IsEmail, IsNotEmpty, IsStrongPassword, IsOptional, IsString, IsUrl, IsIn } from "class-validator";

export class CommunitySignUpDto {
  @IsEmail({}, { message: 'O email informado é inválido.' })
  @IsNotEmpty({ message: 'O email não pode estar vazio.' })
  email: string;

  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  @IsStrongPassword({ minLength: 8, minUppercase: 1, minSymbols: 1 }, { message: 'A senha deve ter no mínimo 8 caracteres, uma letra maiúscula e um símbolo.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl({}, { message: 'A URL do logo é inválida.' })
  logo_url: string;

  @IsString()
  @IsOptional()
  phone_number?: string;

  @IsUrl({}, { message: 'O link do Instagram é inválido.' })
  @IsOptional()
  link_instagram?: string;

  @IsUrl({}, { message: 'O link do LinkedIn é inválido.' })
  @IsOptional()
  link_linkedin?: string;

  @IsUrl({}, { message: 'O link do website é inválido.' })
  @IsOptional()
  link_website?: string;

  @IsUrl({}, { message: 'O link do GitHub é inválido.' })
  @IsOptional()
  link_github?: string;

  @IsString()
  @IsIn(['user', 'community'], { message: 'O papel (role) informado é inválido.' })
  role: 'user' | 'community';

  is_active: boolean;
}

export class UserSignUpDto {

}
