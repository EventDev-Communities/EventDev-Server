import { PrismaService } from '@db/prisma.service'
import { INestApplication } from '@nestjs/common'

/**
 * Test helper for creating authenticated users without relying on session cookies
 * This allows tests to verify business logic without being blocked by SuperTokens
 * cookie integration issues in the test environment.
 */

export interface TestUser {
  id: number
  supertokensId: string
  email: string
  password: string
  isRoot: boolean
}

export interface TestCommunity {
  id: number
  supertokensId: string
  name: string
  description: string
  logoUrl: string | null
}

export interface AuthenticatedContext {
  user?: TestUser
  community?: TestCommunity
  supertokensId: string
}

/**
 * Creates a test user directly in the database
 * Bypasses SuperTokens for testing purposes
 */
export async function createTestUser(
  app: INestApplication,
  email: string,
  password: string,
  isRoot: boolean = false
): Promise<TestUser> {
  const prisma = app.get<PrismaService>(PrismaService)

  // Generate a test supertokens ID (format: test-{timestamp}-{random})
  const supertokensId = `test-${Date.now()}-${Math.random().toString(36).substring(7)}`

  const user = await prisma.user.create({
    data: {
      supertokensId,
      email,
      isRoot,
      isActive: true
    }
  })

  return {
    id: user.id,
    supertokensId: user.supertokensId,
    email: user.email,
    password,
    isRoot: user.isRoot
  }
}/**
  * Creates a test community directly in the database
  * Bypasses SuperTokens for testing purposes
  */
export async function createTestCommunity(
  app: INestApplication,
  name: string,
  description?: string,
  logoUrl?: string
): Promise<TestCommunity> {
  const prisma = app.get<PrismaService>(PrismaService)

  // Generate a test supertokens ID
  const supertokensId = `test-community-${Date.now()}-${Math.random().toString(36).substring(7)}`

  const community = await prisma.community.create({
    data: {
      supertokensId,
      name,
      description: description || `Test description for ${name}`,
      logoUrl: logoUrl || null,
      isActive: true
    }
  })

  return {
    id: community.id,
    supertokensId: community.supertokensId,
    name: community.name,
    description: community.description || '',
    logoUrl: community.logoUrl
  }
}

/**
 * Creates a test user with community role
 * Returns both user and community entities
 */
export async function createTestCommunityUser(
  app: INestApplication,
  email: string,
  password: string,
  communityName: string
): Promise<{ user: TestUser, community: TestCommunity }> {
  const community = await createTestCommunity(app, communityName)

  // For community users, the supertokens ID should match the community
  const prisma = app.get<PrismaService>(PrismaService)

  const user = await prisma.user.create({
    data: {
      supertokensId: community.supertokensId,
      email,
      isRoot: false,
      isActive: true
    }
  })

  return {
    user: {
      id: user.id,
      supertokensId: user.supertokensId,
      email: user.email,
      password,
      isRoot: user.isRoot
    },
    community
  }
}

/**
 * Gets the authenticated context for a test user
 * This simulates what would be in the session/request context
 */
export function getAuthContext(user: TestUser, community?: TestCommunity): AuthenticatedContext {
  return {
    user,
    community,
    supertokensId: user.supertokensId
  }
}

/**
 * Creates request headers that simulate an authenticated request
 * Note: This doesn't use cookies - it's meant for tests that need to verify
 * business logic without going through the full auth flow
 */
export function createAuthHeaders(context: AuthenticatedContext): Record<string, string> {
  return {
    'x-test-user-id': context.supertokensId,
    'x-test-auth': 'true'
  }
}

/**
 * Cleanup helper - removes test users and communities
 */
export async function cleanupTestUsers(
  app: INestApplication,
  emails: string[]
): Promise<void> {
  const prisma = app.get<PrismaService>(PrismaService)

  await prisma.user.deleteMany({
    where: {
      email: {
        in: emails
      }
    }
  })
}

/**
 * Cleanup helper - removes test communities
 */
export async function cleanupTestCommunities(
  app: INestApplication,
  supertokensIds: string[]
): Promise<void> {
  const prisma = app.get<PrismaService>(PrismaService)

  await prisma.community.deleteMany({
    where: {
      supertokensId: {
        in: supertokensIds
      }
    }
  })
}

/**
 * Helper to verify a user exists in the database
 * Useful for testing signup/signin operations
 */
export async function verifyUserExists(
  app: INestApplication,
  email: string
): Promise<boolean> {
  const prisma = app.get<PrismaService>(PrismaService)

  const user = await prisma.user.findUnique({
    where: { email }
  })

  return user !== null
}

/**
 * Helper to verify a community exists in the database
 */
export async function verifyCommunityExists(
  app: INestApplication,
  name: string
): Promise<boolean> {
  const prisma = app.get<PrismaService>(PrismaService)

  const community = await prisma.community.findFirst({
    where: { name }
  })

  return community !== null
}

/**
 * Helper to get community ID by name
 */
export async function getCommunityIdByName(
  app: INestApplication,
  name: string
): Promise<number | null> {
  const prisma = app.get<PrismaService>(PrismaService)

  const community = await prisma.community.findFirst({
    where: { name },
    select: { id: true }
  })

  return community?.id ?? null
}

/**
 * Helper to get user ID by email
 */
export async function getUserIdByEmail(
  app: INestApplication,
  email: string
): Promise<number | null> {
  const prisma = app.get<PrismaService>(PrismaService)

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  })

  return user?.id ?? null
}
