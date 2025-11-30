import { PrismaClient } from '@prisma/client'
import { logger } from '../logger'

export async function seedTicketTypes(prisma: PrismaClient) {
  logger.info('Seeding Ticket Types (ensuring at least one per event)...')

  const events = await prisma.event.findMany()

  for (const event of events) {
    // 1. Ensure Free Ticket
    const existingFree = await prisma.ticketType.findFirst({
      where: { eventId: event.id, price: 0 }
    })

    if (!existingFree) {
      await prisma.ticketType.create({
        data: {
          eventId: event.id,
          name: 'Ingresso Gratuito',
          description: 'Ingresso gratuito gerado pelo seed',
          price: 0.0,
          quantity: 100,
          isActive: true
        }
      })
      logger.debug(`   - Default free ticket created for event ${event.id}`)
    }
  }

  // 2. Ensure Paid Ticket (VIP) - Only for the first event
  if (events.length > 0) {
    const vipEvent = events[0]
    const existingPaid = await prisma.ticketType.findFirst({
      where: { eventId: vipEvent.id, price: { gt: 0 } }
    })

    if (!existingPaid) {
      await prisma.ticketType.create({
        data: {
          eventId: vipEvent.id,
          name: 'Ingresso VIP',
          description: 'Acesso VIP com benefícios exclusivos',
          price: 150.0,
          quantity: 50,
          isActive: true
        }
      })
      logger.debug(`   - VIP paid ticket created for event ${vipEvent.id}`)
    }
  }

  logger.info('   - Ticket types seeding completed')
}

// Run standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  const prisma = new PrismaClient()
  seedTicketTypes(prisma)
    .catch((error) => {
      logger.error('ERROR: Failed to seed Ticket Types:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
