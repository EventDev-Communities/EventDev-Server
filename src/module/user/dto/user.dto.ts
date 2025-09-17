import { IsNotEmpty, IsString } from "class-validator";

export class UserCreateDto {
    @IsNotEmpty()
    @IsString()
    function: string;

    @IsNotEmpty()
    @IsString()
    supertokens_id: string;

    usuarioRoot: boolean | null;

    is_active: boolean;

    updated_at: Date | null;

    created_at: Date;

    name: string;
}

/**
 *  function: string;
    id: number;
    supertokens_id: string;
    email: string;
    password: string;
    usuario_root: boolean | null;
    is_active: boolean;
    updated_at: Date | null;
    created_at: Date;
 */