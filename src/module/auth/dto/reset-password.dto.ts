import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;
}