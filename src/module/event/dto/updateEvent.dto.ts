import { PartialType } from '@nestjs/mapped-types'
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator'
import { EventDto } from './event.dto'
import { Type } from 'class-transformer'
import { AddressDto } from 'src/module/address/dto/address.dto'

export class PartialAddressDto extends PartialType(AddressDto) {}

export class UpdateEventDto {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => EventDto)
  event: EventDto

  @IsOptional()
  @ValidateNested()
  @Type(() => PartialAddressDto)
  address?: PartialAddressDto
}
