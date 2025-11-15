import { PrismaClient } from '@prisma/client'

import { logger } from '../logger'

export async function seedLinkType(prisma: PrismaClient) {
  logger.info(' Seeding LinkType...')

  const linkTypes = [
    {
      code: 'WEBSITE',
      name: 'Website',
      description: 'Site oficial da comunidade'
    },
    {
      code: 'INSTAGRAM',
      name: 'Instagram',
      description: 'Perfil no Instagram'
    },
    {
      code: 'LINKEDIN',
      name: 'LinkedIn',
      description: 'Página no LinkedIn'
    },
    {
      code: 'GITHUB',
      name: 'GitHub',
      description: 'Organização no GitHub'
    },
    {
      code: 'TWITTER',
      name: 'Twitter/X',
      description: 'Perfil no Twitter/X'
    },
    {
      code: 'FACEBOOK',
      name: 'Facebook',
      description: 'Página no Facebook'
    },
    {
      code: 'YOUTUBE',
      name: 'YouTube',
      description: 'Canal no YouTube'
    },
    {
      code: 'DISCORD',
      name: 'Discord',
      description: 'Servidor no Discord'
    },
    {
      code: 'TELEGRAM',
      name: 'Telegram',
      description: 'Grupo ou canal no Telegram'
    },
    {
      code: 'WHATSAPP',
      name: 'WhatsApp',
      description: 'Grupo ou comunidade no WhatsApp'
    },
    {
      code: 'OTHER',
      name: 'Outro',
      description: 'Outro tipo de link ou rede social'
    }
  ]

  await Promise.all(
    linkTypes.map((linkType) =>
      prisma.linkType.upsert({
        where: { code: linkType.code },
        update: {},
        create: {
          code: linkType.code,
          name: linkType.name,
          description: linkType.description,
          isActive: true
        }
      }),
    ),
  )

  logger.info(`   - ${linkTypes.length} link types created`)
}

// Run standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  const prisma = new PrismaClient()
  seedLinkType(prisma)
    .catch((error) => {
      logger.error('ERROR: Failed to seed LinkType:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

