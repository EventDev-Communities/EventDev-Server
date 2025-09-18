import { IsNotEmpty, ValidateIf, ValidateNested } from 'class-validator'
import { AddressDto } from '../../address/dto/address.dto'
import { Type } from 'class-transformer'
import { EventDto } from './event.dto'

export class CreateEventDto extends EventDto {
  @ValidateIf((o) => o.modalidade === 'PRESENTIAL')
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto
}