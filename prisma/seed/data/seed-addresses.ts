import { PrismaClient } from '@prisma/client'

import { logger } from '../logger'

const addressesData = [
  {
    cep: '60060390',
    streetAddress: 'Rua Dragão do Mar',
    number: '81',
    complement: 'Centro Dragão do Mar de Arte e Cultura',
    neighborhood: 'Praia de Iracema',
    city: 'Fortaleza',
    state: 'CE'
  },
  {
    cep: '60811905',
    streetAddress: 'Av. Washington Soares',
    number: '1321',
    complement: 'Universidade de Fortaleza - UNIFOR',
    neighborhood: 'Edson Queiroz',
    city: 'Fortaleza',
    state: 'CE'
  },
  {
    cep: '60175055',
    streetAddress: 'Rua Desembargador Lauro Nogueira',
    number: '1500',
    complement: 'Teatro RioMar Fortaleza',
    neighborhood: 'Papicu',
    city: 'Fortaleza',
    state: 'CE'
  }
]

export async function seedAddresses(prisma: PrismaClient) {
  logger.info('Seeding Addresses...')

  for (const data of addressesData) {
    // Check if address already exists
    const existing = await prisma.address.findFirst({
      where: {
        cep: data.cep,
        streetAddress: data.streetAddress,
        number: data.number
      }
    })

    if (existing) {
      logger.debug(`   - Address already exists: ${data.streetAddress}, ${data.number}`)
    } else {
      await prisma.address.create({ data })
      logger.debug(`   - ${data.streetAddress}, ${data.number} - ${data.city}/${data.state}`)
    }
  }

  logger.info(`   - Address seeding completed`)
}

// Run standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  const prisma = new PrismaClient()
  seedAddresses(prisma)
    .catch((error) => {
      logger.error('ERROR: Failed to seed Addresses:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
