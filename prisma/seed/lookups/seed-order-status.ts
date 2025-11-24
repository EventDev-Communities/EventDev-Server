import { PrismaClient } from '@prisma/client'

import { logger } from '../logger'

export async function seedOrderStatus(prisma: PrismaClient) {
  logger.info(' Seeding OrderStatus...')

  interface OrderStatusSeed {
    code: string
    name: string
    description: string
  }

  const statuses = [
    {
      code: 'PENDING',
      name: 'Pending',
      description: 'Order is pending payment confirmation'
    },
    {
      code: 'CONFIRMED',
      name: 'Confirmed',
      description: 'Order has been confirmed and paid'
    },
    {
      code: 'PROCESSING',
      name: 'Processing',
      description: 'Order is being processed'
    },
    {
      code: 'COMPLETED',
      name: 'Completed',
      description: 'Order has been completed and delivered'
    },
    {
      code: 'CANCELLED',
      name: 'Cancelled',
      description: 'Order has been cancelled'
    },
    {
      code: 'REFUNDED',
      name: 'Refunded',
      description: 'Order has been refunded'
    }
  ] satisfies ReadonlyArray<OrderStatusSeed>

  await Promise.all(
    statuses.map((status) =>
      prisma.orderStatus.upsert({
        where: { code: status.code },
        update: {},
        create: {
          code: status.code,
          name: status.name,
          description: status.description,
          isActive: true
        }
      }),
    ),
  )

  logger.info(`   - ${statuses.length} order statuses created`)
}

// Run standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  const prisma = new PrismaClient()
  seedOrderStatus(prisma)
    .catch((error) => {
      logger.error('ERROR: Failed to seed OrderStatus:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

