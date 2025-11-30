import { PartialAddressDto } from '@module/address/dto/partial-address.dto'
import { validate } from 'class-validator'

describe('PartialAddressDto', () => {
  it('should validate a valid partial address', async () => {
    const dto = new PartialAddressDto()
    dto.street = 'Main St'
    dto.city = 'New York'
    dto.state = 'NY'
    dto.zip = '10001'
    dto.number = '123'

    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should validate an empty object (all optional)', async () => {
    const dto = new PartialAddressDto()
    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should fail if types are incorrect', async () => {
    const dto = new PartialAddressDto()
    // @ts-expect-error -- testing invalid type
    dto.street = 123
    // @ts-expect-error -- testing invalid type
    dto.city = 123
    // @ts-expect-error -- testing invalid type
    dto.state = 123
    // @ts-expect-error -- testing invalid type
    dto.zip = 123
    // @ts-expect-error -- testing invalid type
    dto.number = 123

    const errors = await validate(dto)
    expect(errors.length).toBe(5)
  })
})
