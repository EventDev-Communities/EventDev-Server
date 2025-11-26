import { CreateCommunityDto } from '@module/community/dto/create-community.dto'
import { PartialType } from '@nestjs/swagger'

export class UpdateCommunityDto extends PartialType(CreateCommunityDto) {}
