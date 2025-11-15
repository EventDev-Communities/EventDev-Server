import { PrismaClient } from '@prisma/client'

import { logger } from '../logger'

export async function seedEventModality(prisma: PrismaClient) {
  logger.info(' Seeding EventModality...')

  const modalities = [
    {
      code: 'PRESENTIAL',
      name: 'Presencial',
      description: 'Evento presencial com participação física'
    },
    {
      code: 'ONLINE',
      name: 'Online',
      description: 'Evento virtual realizado remotamente'
    },
    {
      code: 'HYBRID',
      name: 'Híbrido',
      description: 'Evento com opção presencial e online'
    }
  ]

  await Promise.all(
    modalities.map((modality) =>
      prisma.eventModality.upsert({
        where: { code: modality.code },
        update: {},
        create: {
          code: modality.code,
          name: modality.name,
          description: modality.description,
          isActive: true
        }
      }),
    ),
  )

  logger.info(`   - ${modalities.length} modalities created`)
}

// Standalone execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const prisma = new PrismaClient()
  seedEventModality(prisma)
    .catch((error) => {
      logger.error('ERROR: Failed to seed EventModality:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
