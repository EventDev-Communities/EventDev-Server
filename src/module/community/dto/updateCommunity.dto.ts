import { CreateCommunityDto } from '@module/community/dto/createCommunity.dto'
import { PartialType } from '@nestjs/swagger'

export class UpdateCommunityDto extends PartialType(CreateCommunityDto) {}
