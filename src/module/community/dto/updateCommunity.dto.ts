import { CreateCommunityDto } from './createCommunity.dto'
import { PartialType } from '@nestjs/mapped-types'
export class UpdateCommunityDto extends PartialType(CreateCommunityDto) {}
