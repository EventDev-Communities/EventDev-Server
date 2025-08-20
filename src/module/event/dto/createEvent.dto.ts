import { IsNotEmpty, ValidateIf, ValidateNested } from 'class-validator'
import { EventDto } from './event.dto'
import { AddressDto } from '../../address/dto/address.dto'
import { Type } from 'class-transformer'

export class CreateEventDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => EventDto)
  event: EventDto

  @ValidateIf((o) => o.event?.modality === 'PRESENTIAL')
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto
}
