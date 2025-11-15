import { PrismaClient } from '@prisma/client'

import { logger } from '../logger'

export async function seedTicketStatus(prisma: PrismaClient) {
  logger.info(' Seeding TicketStatus...')

  const statuses = [
    {
      code: 'PENDING',
      name: 'Pendente',
      description: 'Compra do ingresso pendente de confirmação'
    },
    {
      code: 'CONFIRMED',
      name: 'Confirmado',
      description: 'Ingresso confirmado e pronto para uso'
    },
    {
      code: 'CANCELLED',
      name: 'Cancelado',
      description: 'Ingresso cancelado pelo usuário ou sistema'
    },
    {
      code: 'REFUNDED',
      name: 'Reembolsado',
      description: 'Valor do ingresso reembolsado'
    },
    {
      code: 'USED',
      name: 'Utilizado',
      description: 'Ingresso já utilizado no check-in'
    }
  ]

  await Promise.all(
    statuses.map((status) =>
      prisma.ticketStatus.upsert({
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

  logger.info(`   - ${statuses.length} ticket statuses created`)
}

// Run standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  const prisma = new PrismaClient()
  seedTicketStatus(prisma)
    .catch((error) => {
      logger.error('ERROR: Failed to seed TicketStatus:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

