import { PrismaClient } from '@prisma/client'

import { addressSeedData } from './seed-datasets'
import { logger } from '../logger'

export async function seedAddresses(prisma: PrismaClient) {
  logger.info('Seeding Addresses...')

  for (const data of addressSeedData) {
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
