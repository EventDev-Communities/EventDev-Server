import { PrismaClient } from '@prisma/client'

import { logger } from '../logger'

export async function seedUserRole(prisma: PrismaClient) {
  logger.info(' Seeding UserRole...')

  const roles = [
    {
      code: 'OWNER',
      name: 'Proprietário',
      description: 'Dono da comunidade com todas as permissões',
      level: 1
    },
    {
      code: 'ADMIN',
      name: 'Administrador',
      description: 'Administrador com permissões de gerenciamento',
      level: 2
    },
    {
      code: 'MODERATOR',
      name: 'Moderador',
      description: 'Moderador com permissões de moderação de conteúdo',
      level: 3
    },
    {
      code: 'MEMBER',
      name: 'Membro',
      description: 'Membro regular da comunidade',
      level: 4
    }
  ]

  await Promise.all(
    roles.map((role) =>
      prisma.userRole.upsert({
        where: { code: role.code },
        update: {},
        create: {
          code: role.code,
          name: role.name,
          description: role.description,
          level: role.level,
          isActive: true
        }
      }),
    ),
  )

  logger.info(`   - ${roles.length} roles created`)
}

// Run standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  const prisma = new PrismaClient()
  seedUserRole(prisma)
    .catch((error) => {
      logger.error('ERROR: Failed to seed UserRole:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
