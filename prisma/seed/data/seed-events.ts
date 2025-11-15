import { PrismaClient } from '@prisma/client'

import { logger } from '../logger'

const eventsData = [
  {
    community: 'Frontend CE',
    title: 'Frontend Day 2025',
    description:
      'Evento anual da comunidade Frontend CE com palestras, workshops e networking sobre as últimas tendências em desenvolvimento frontend.',
    modality: 'PRESENTIAL',
    address: {
      cep: '60060390',
      streetAddress: 'Rua Dragão do Mar',
      number: '81'
    },
    coverUrl: '/images/events/frontend-day-2025.jpg',
    link: 'https://frontendce.com/frontend-day-2025',
    startDateTime: new Date('2025-05-15T08:00:00-03:00'),
    endDateTime: new Date('2025-05-15T18:00:00-03:00')
  },
  {
    community: 'PHP com Rapadura',
    title: 'PHP com Rapadura Mentoria',
    description: 'Programa de mentoria para desenvolvedores PHP iniciantes e intermediários. Aprenda com os melhores profissionais da comunidade.',
    modality: 'ONLINE',
    coverUrl: '/images/events/php-mentoria-2025.jpg',
    link: 'https://phpcomrapadura.org/mentoria',
    startDateTime: new Date('2025-03-01T19:00:00-03:00'),
    endDateTime: new Date('2025-03-01T21:00:00-03:00')
  },
  {
    community: 'Python Nordeste',
    title: 'Python Nordeste 2025',
    description: 'A maior conferência de Python do Nordeste! Três dias de imersão com palestras, tutoriais, sprints e muito networking.',
    modality: 'HYBRID',
    address: {
      cep: '60811905',
      streetAddress: 'Av. Washington Soares',
      number: '1321'
    },
    coverUrl: '/images/events/python-nordeste-2025.jpg',
    link: 'https://2025.pythonnordeste.org',
    startDateTime: new Date('2025-06-19T08:00:00-03:00'),
    endDateTime: new Date('2025-06-21T18:00:00-03:00')
  }
]

export async function seedEvents(prisma: PrismaClient) {
  logger.info('Seeding Events...')

  for (const data of eventsData) {
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
