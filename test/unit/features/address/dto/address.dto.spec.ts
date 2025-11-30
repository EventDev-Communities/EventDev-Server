import { AddressDto } from '@module/address/dto/address.dto'
import { validate } from 'class-validator'

describe('AddressDto', () => {
  it('should validate a valid address', async () => {
    const dto = new AddressDto()
    dto.cep = '01310100'
    dto.state = 'SP'
    dto.city = 'São Paulo'
    dto.neighborhood = 'Bela Vista'
    dto.streetAddress = 'Avenida Paulista'
    dto.number = '1578'

    const errors = await validate(dto)
    expect(errors.length).toBe(0)
  })

  it('should fail validation with invalid CEP', async () => {
    const dto = new AddressDto()
    dto.cep = '123' // Invalid

    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].property).toBe('cep')
  })
})
