import { PrismaClient } from '@prisma/client'
import supertokens from 'supertokens-node'
import EmailPassword from 'supertokens-node/recipe/emailpassword'
import UserRoles from 'supertokens-node/recipe/userroles'

import { visitorSeedData } from './seed-datasets'
import { logger } from '../logger'

async function createSupertokensVisitor(prisma: PrismaClient, email: string, password: string) {
  const response = await EmailPassword.signUp('public', email, password)
  if (response.status !== 'OK') {
    logger.debug(`   - Visitor ${email} already exists`)

    // Try to find in local DB first
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return existingUser.supertokensId
    }

    // If not in local DB (e.g. after db-reset), fetch from SuperTokens
    const users = await supertokens.listUsersByAccountInfo('public', { email })
    if (users.length > 0) {
      return users[0].id
    }

    return null
  }
  // Ensure 'user' role exists
  await UserRoles.createNewRoleOrAddPermissions('user', [])
  await UserRoles.addRoleToUser('public', response.user.id, 'user')
  return response.user.id
}

export async function seedVisitors(prisma: PrismaClient) {
  logger.info('Seeding Visitors...')

  for (const data of visitorSeedData) {
    logger.debug(`   - Creating visitor: ${data.name}`)

    // Create user in SuperTokens
    const supertokensId = await createSupertokensVisitor(prisma, data.email, 'Senha123!')

    if (!supertokensId) {
      logger.warn(`   - Skipping ${data.name} - error creating user`)
      continue
    }

    // Create user in database
    await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        supertokensId,
        email: data.email,
        isActive: true
      }
    })
  }
}
