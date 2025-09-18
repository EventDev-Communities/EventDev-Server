import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator'

export class CreateCommunityDto {
  @IsNotEmpty()
  @IsString()
  supertokens_id: string;
}
