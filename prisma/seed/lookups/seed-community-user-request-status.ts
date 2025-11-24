import { PrismaClient } from '@prisma/client'

import { logger } from '../logger'

export async function seedCommunityUserRequestStatus(prisma: PrismaClient) {
  logger.info(' Seeding CommunityUserRequestStatus...')

  interface CommunityUserRequestStatusSeed {
    code: string
    name: string
    description: string
  }

  const statuses = [
    {
      code: 'PENDING',
      name: 'Pendente',
      description: 'Solicitação aguardando revisão'
    },
    {
      code: 'APPROVED',
      name: 'Aprovado',
      description: 'Solicitação aprovada'
    },
    {
      code: 'REJECTED',
      name: 'Rejeitado',
      description: 'Solicitação rejeitada'
    }
  ] satisfies ReadonlyArray<CommunityUserRequestStatusSeed>

  await Promise.all(
    statuses.map(async (status) =>
      await prisma.communityUserRequestStatus.upsert({
        where: { code: status.code },
        update: {},
        create: {
          code: status.code,
          name: status.name,
          description: status.description,
          isActive: true
        }
      })
    )
  )

  logger.info(`   - ${statuses.length} statuses created`)
}

// Run standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  const prisma = new PrismaClient()
  seedCommunityUserRequestStatus(prisma)
    .catch((error) => {
      logger.error('ERROR: Failed to seed CommunityUserRequestStatus:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
