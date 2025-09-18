import { PartialType } from '@nestjs/mapped-types'
import { IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { AddressDto } from 'src/module/address/dto/address.dto'
import { EventDto } from './event.dto'

export class PartialAddressDto extends PartialType(AddressDto) {}

export class UpdateEventDto extends PartialType(EventDto) {
  @IsOptional()
  @ValidateNested()
  @Type(() => PartialAddressDto)
  address?: PartialAddressDto
}