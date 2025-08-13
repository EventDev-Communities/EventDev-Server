import { IsNumberString, IsString, Length, Matches, Max, Min } from "class-validator"

export class AddressDto {
    @Matches(/^\d{8}$/, { message: 'CEP inválido. Deve conter exatamente 8 dígitos numéricos.' })
    cep: string

    @IsString()
    state: string

    @IsString()
    city: string

    @IsString()
    neighborhood: string

    @IsString()
    streetAddress: string

    @IsString()
    number: string
}