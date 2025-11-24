import { PrismaClient } from '@prisma/client'

import { eventSeedData } from './seed-datasets'
import { logger } from '../logger'

export async function seedEvents(prisma: PrismaClient) {
  logger.info('Seeding Events...')

  for (const data of eventSeedData) {
    logger.debug(`   - Creating event: ${data.title}`)

    // Find community
    const community = await prisma.community.findFirst({
      where: { name: data.community }
    })

    if (!community) {
      logger.warn(`   - Community ${data.community} not found`)
      continue
    }

    // Find modality
    const modality = await prisma.eventModality.findUnique({
      where: { code: data.modality }
    })

    if (!modality) {
      logger.warn(`   - Modality ${data.modality} not found`)
      continue
    }

    // Find address if presential or hybrid
    let addressId: number | null = null
    if (data.address) {
      const address = await prisma.address.findFirst({
        where: {
          cep: data.address.cep,
          streetAddress: data.address.streetAddress,
          number: data.address.number
        }
      })

      if (!address) {
        logger.warn(`   - Address not found for ${data.title}`)
        continue
      }

      addressId = address.id
    }

    // Create event
    await prisma.event.upsert({
      where: {
        id: 0 // Placeholder - will always create new
      },
      update: {},
      create: {
        communityId: community.id,
        modalityId: modality.id,
        addressId,
        title: data.title,
        description: data.description,
        coverUrl: data.coverUrl,
        link: data.link,
        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
        isActive: true
      }
    })

    logger.debug(`   - ${data.title} created successfully`)
  }

  logger.info(`   - Event seeding completed`)
}

// Run standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  const prisma = new PrismaClient()
  seedEvents(prisma)
    .catch((error) => {
      logger.error('ERROR: Failed to seed Events:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
