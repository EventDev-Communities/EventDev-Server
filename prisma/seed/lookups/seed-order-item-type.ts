import { PrismaClient } from '@prisma/client'

import { logger } from '../logger'

export async function seedOrderItemType(prisma: PrismaClient) {
  logger.info(' Seeding OrderItemType...')

  interface OrderItemTypeSeed {
    code: string
    name: string
    description: string
  }

  const types = [
    {
      code: 'TICKET',
      name: 'Event Ticket',
      description: 'Ticket for event admission'
    },
    {
      code: 'PRODUCT',
      name: 'Physical Product',
      description: 'Physical merchandise or product'
    },
    {
      code: 'MERCHANDISE',
      name: 'Merchandise',
      description: 'Community branded merchandise'
    },
    {
      code: 'DONATION',
      name: 'Donation',
      description: 'Monetary donation to community or event'
    },
    {
      code: 'MEMBERSHIP',
      name: 'Membership',
      description: 'Community membership subscription'
    },
    {
      code: 'SERVICE',
      name: 'Service',
      description: 'Service or consultation'
    }
  ] satisfies ReadonlyArray<OrderItemTypeSeed>

  await Promise.all(
    types.map((type) =>
      prisma.orderItemType.upsert({
        where: { code: type.code },
        update: {},
        create: {
          code: type.code,
          name: type.name,
          description: type.description,
          isActive: true
        }
      }),
    ),
  )

  logger.info(`   - ${types.length} order item types created`)
}

// Run standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  const prisma = new PrismaClient()
  seedOrderItemType(prisma)
    .catch((error) => {
      logger.error('ERROR: Failed to seed OrderItemType:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
