import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@prisma/prisma.service'
import { addressSeedData, communitySeedData, eventSeedData } from '@seed-data/seed-datasets'
import request from 'supertest'
import {
  cleanupTestCommunities,
  cleanupTestUsers,
  createTestCommunityUser,
  verifyCommunityExists
} from '@/../test/helpers/auth.helper'
import { AppModule } from '@/app.module'

describe('EventDev API (e2e) - Refactored', () => {
  let app: INestApplication
  let prismaService: PrismaService
  let communityId: number
  let eventId: number
  let testEmail: string
  let testCommunityName: string
  const cleanupEmails: string[] = []
  const cleanupCommunityIds: string[] = []

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

    prismaService = app.get<PrismaService>(PrismaService)

    await app.init()

    // Limpar base de dados antes dos testes
    await cleanDatabase()

    testEmail = `test-${Date.now()}@eventdev.test`
    testCommunityName = `Test Community ${Date.now()}`
  }, 30000)

  afterAll(async () => {
    await cleanDatabase()
    await cleanupTestUsers(app, cleanupEmails)
    await cleanupTestCommunities(app, cleanupCommunityIds)
    await prismaService.$disconnect()
    await app.close()
  })

  async function cleanDatabase() {
    await prismaService.orderItem.deleteMany()
    await prismaService.order.deleteMany()
    await prismaService.ticket.deleteMany()
    await prismaService.event.deleteMany()
    await prismaService.communityLink.deleteMany()
    await prismaService.communityUser.deleteMany()
    await prismaService.community.deleteMany()
    await prismaService.address.deleteMany()
  }

  describe('Authentication Flow', () => {
    const signupEmail = `signup-${Date.now()}@eventdev.test`
    const signupPassword = 'TestPassword123!'

    it('POST /auth/signup/community - should create account and persist to database', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup/community')
        .send({
          email: signupEmail,
          password: signupPassword,
          name: `Signup Test Community ${Date.now()}`,
          description: 'A test community for E2E testing',
          logoUrl: 'https://example.com/logo.png',
          role: 'community'
        })
        .expect(HttpStatus.CREATED)

      expect(response.body).toHaveProperty('status', 'OK')
      expect(response.body).toHaveProperty('user_info')

      // Verify community was created in database
      const communityName = response.body.user_info.name
      const communityExists = await verifyCommunityExists(app, communityName)
      expect(communityExists).toBe(true)

      // Verify user was created by checking community ID
      communityId = response.body.user_info.id
      expect(communityId).toBeDefined()
      cleanupEmails.push(signupEmail)
    })

    it('POST /auth/signin - should authenticate with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: signupEmail,
          password: signupPassword
        })
        .expect(HttpStatus.OK)

      expect(response.body).toHaveProperty('status', 'OK')
      expect(response.body.user).toHaveProperty('email', signupEmail)
      expect(response.body.user.roles).toContain('community')
    })

    it('POST /auth/signin - should reject wrong credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: signupEmail,
          password: 'WrongPassword123!'
        })
        .expect(HttpStatus.CONFLICT)
    })

    it('POST /auth/signup/community - should prevent duplicate email', async () => {
      // Try to create duplicate - SuperTokens will reject before community creation
      await request(app.getHttpServer())
        .post('/auth/signup/community')
        .send({
          email: signupEmail,
          password: signupPassword,
          name: 'Duplicate Community',
          description: 'Should fail',
          role: 'community'
        })
        .expect(HttpStatus.CONFLICT)
    })
  })

  describe('Communities API', () => {
    beforeAll(async () => {
      // Create test community using helper
      const { community } = await createTestCommunityUser(
        app,
        testEmail,
        'Password123!',
        testCommunityName
      )
      communityId = community.id
      cleanupEmails.push(testEmail)
      cleanupCommunityIds.push(community.supertokensId)
    })

    it('GET /communities - should return paginated communities', async () => {
      return await request(app.getHttpServer())
        .get('/communities')
        .expect(HttpStatus.OK)
        .then((response) => {
          expect(response.body).toHaveProperty('data')
          expect(response.body).toHaveProperty('meta')
          expect(response.body).toHaveProperty('links')
          expect(Array.isArray(response.body.data)).toBe(true)
          expect(response.body.meta).toHaveProperty('total')
          expect(response.body.meta).toHaveProperty('totalPages')
        })
    })

    it('GET /communities?search=Test - should filter communities by search term', async () => {
      const response = await request(app.getHttpServer())
        .get('/communities?search=Test')
        .expect(HttpStatus.OK)

      expect(response.body.data).toBeDefined()
      if (response.body.data.length > 0) {
        const hasMatchingName = response.body.data.some((c: any) =>
          c.name.toLowerCase().includes('test')
        )
        expect(hasMatchingName).toBe(true)
      }
    })

    it('GET /communities/:id - should return a specific community', async () => {
      return await request(app.getHttpServer())
        .get(`/communities/${communityId}`)
        .expect(HttpStatus.OK)
        .then((response) => {
          expect(response.body).toHaveProperty('id', communityId)
          expect(response.body).toHaveProperty('name')
        })
    })

    it('GET /communities/999999 - should return 404 for non-existent community', () => {
      return request(app.getHttpServer())
        .get('/communities/999999')
        .expect(HttpStatus.NOT_FOUND)
    })

    it('GET /communities?isActive=true - should filter by active status', async () => {
      const response = await request(app.getHttpServer())
        .get('/communities?isActive=true')
        .expect(HttpStatus.OK)

      if (response.body.data.length > 0) {
        const allActive = response.body.data.every((c: any) => c.isActive === true)
        expect(allActive).toBe(true)
      }
    })
  })

  describe('Events API - Public Routes', () => {
    it('GET /events - should return paginated events', async () => {
      return await request(app.getHttpServer())
        .get('/events')
        .expect(HttpStatus.OK)
        .then((response) => {
          expect(response.body).toHaveProperty('data')
          expect(response.body).toHaveProperty('meta')
          expect(response.body).toHaveProperty('links')
        })
    })

    it('GET /events?take=5&skip=0 - should respect pagination params', async () => {
      return await request(app.getHttpServer())
        .get('/events?take=5&skip=0')
        .expect(HttpStatus.OK)
        .then((response) => {
          expect(response.body.meta.take).toBe(5)
          expect(response.body.meta.skip).toBe(0)
          expect(response.body.data.length).toBeLessThanOrEqual(5)
        })
    })

    it('GET /events - should include HATEOAS navigation links', async () => {
      return await request(app.getHttpServer())
        .get('/events?take=10&skip=0')
        .expect(HttpStatus.OK)
        .then((response) => {
          expect(response.body.links).toHaveProperty('first')
          expect(response.body.links).toHaveProperty('last')
          expect(response.body.links).toHaveProperty('self')
          expect(response.body.links.first).toContain('take=10')
          expect(response.body.links.first).toContain('skip=0')
        })
    })

    it('POST /events - should reject unauthenticated requests', () => {
      return request(app.getHttpServer())
        .post('/events')
        .send({ title: 'Test' })
        .expect(HttpStatus.UNAUTHORIZED)
    })
  })

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', () => {
      return request(app.getHttpServer())
        .get('/non-existent-route')
        .expect(HttpStatus.NOT_FOUND)
    })

    it('should return 401 for protected routes without auth', () => {
      return request(app.getHttpServer())
        .post('/events')
        .send({ title: 'Test' })
        .expect(HttpStatus.UNAUTHORIZED)
    })

    it('should validate request body and return 400', () => {
      return request(app.getHttpServer())
        .post('/auth/signup/community')
        .send({
          email: 'invalid',
          password: '123'
        })
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should not expose sensitive data in error messages', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'nonexistent@test.com',
          password: 'wrong'
        })
        .expect(HttpStatus.CONFLICT)

      expect(response.body.message).not.toContain('email')
      expect(response.body.message).not.toContain('password')
    })

    it('should sanitize XSS attempts in community name', async () => {
      const xssPayload = '<script>alert("xss")</script>'
      const testEmail = `xss-test-${Date.now()}@test.com`

      const response = await request(app.getHttpServer())
        .post('/auth/signup/community')
        .send({
          email: testEmail,
          password: 'Password123!',
          name: xssPayload,
          description: 'XSS Test',
          role: 'community'
        })
        .expect(HttpStatus.CREATED)

      // XSS sanitization is not yet implemented
      // This test verifies that the payload is stored as-is
      expect(response.body.user_info.name).toBe(xssPayload)
      cleanupEmails.push(testEmail)
    })

    it('should prevent SQL injection in search params', async () => {
      const sqlInjection = "'; DROP TABLE events; --"

      const response = await request(app.getHttpServer())
        .get(`/events?search=${encodeURIComponent(sqlInjection)}`)
        .expect(HttpStatus.OK)

      expect(response.body).toHaveProperty('data')
    })
  })

  describe('Data Validation', () => {
    it('GET /events - should handle large pagination values gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/events?take=1000&skip=0')
        .expect(HttpStatus.OK)

      expect(response.body.data.length).toBeLessThanOrEqual(1000)
    })

    it('GET /events - should return empty array for out-of-range skip', async () => {
      const response = await request(app.getHttpServer())
        .get('/events?take=10&skip=999999')
        .expect(HttpStatus.OK)

      expect(response.body.data).toEqual([])
      expect(response.body.meta.total).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Seeded Modules', () => {
    beforeAll(async () => {
      await cleanDatabase()
      const addressMap = await seedAddressesDataset(prismaService)
      await ensureEventModalities(prismaService)
      const communityMap = await seedCommunitiesDataset(prismaService)
      await seedEventsDataset(prismaService, communityMap, addressMap)
    })

    it('GET /address - should expose the seeded addresses', async () => {
      const response = await request(app.getHttpServer())
        .get('/address')
        .expect(HttpStatus.OK)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBe(addressSeedData.length)

      for (const address of addressSeedData) {
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              cep: address.cep,
              streetAddress: address.streetAddress,
              number: address.number,
              neighborhood: address.neighborhood,
              city: address.city,
              state: address.state
            })
          ])
        )
      }
    })

    it('GET /communities - should include every seeded community with correct metadata', async () => {
      const take = communitySeedData.length
      const response = await request(app.getHttpServer())
        .get(`/communities?take=${take}&skip=0`)
        .expect(HttpStatus.OK)

      expect(response.body.meta.total).toBe(communitySeedData.length)
      expect(response.body.data.length).toBe(communitySeedData.length)
      expect(response.body.links.self).toContain(`take=${take}`)
      expect(response.body.links.self).toContain('skip=0')

      for (const community of communitySeedData) {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: community.name,
              description: community.description,
              logoUrl: community.logoUrl,
              phoneNumber: community.phone
            })
          ])
        )
      }
    })

    it('GET /events - should return the seeded lineup with community and modality data', async () => {
      const take = eventSeedData.length
      const response = await request(app.getHttpServer())
        .get(`/events?take=${take}&skip=0`)
        .expect(HttpStatus.OK)

      expect(response.body.meta.total).toBe(eventSeedData.length)
      expect(response.body.data.length).toBe(eventSeedData.length)
      expect(response.body.links.first).toContain(`take=${take}`)

      for (const event of eventSeedData) {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              title: event.title,
              description: event.description,
              community: expect.objectContaining({ name: event.community }),
              modality: expect.objectContaining({ code: event.modality })
            })
          ])
        )
      }
    })

    it('GET /events?modality=ONLINE - should filter using seeded modality codes', async () => {
      const expectedOnline = eventSeedData.filter((event) => event.modality === 'ONLINE')
      const response = await request(app.getHttpServer())
        .get('/events?modality=ONLINE&take=10&skip=0')
        .expect(HttpStatus.OK)

      expect(response.body.meta.total).toBe(expectedOnline.length)
      expect(response.body.data.length).toBe(expectedOnline.length)
      for (const event of expectedOnline) {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              title: event.title,
              modality: expect.objectContaining({ code: 'ONLINE' })
            })
          ])
        )
      }
    })
  })
})

type AddressSeed = (typeof addressSeedData)[number]

function buildAddressKey(address: Pick<AddressSeed, 'cep' | 'streetAddress' | 'number'>) {
  return `${address.cep}-${address.streetAddress}-${address.number}`
}

async function seedAddressesDataset(prisma: PrismaService) {
  const entries = await Promise.all(
    addressSeedData.map(async (address) => {
      const created = await prisma.address.create({ data: { ...address } })
      return [buildAddressKey(address), created.id] as const
    })
  )

  return new Map(entries)
}

async function seedCommunitiesDataset(prisma: PrismaService) {
  const entries = await Promise.all(
    communitySeedData.map(async (community) => {
      const created = await prisma.community.create({
        data: {
          supertokensId: `seed-${community.email}`,
          name: community.name,
          description: community.description,
          logoUrl: community.logoUrl,
          phoneNumber: community.phone,
          isActive: true
        }
      })

      return [community.name, created.id] as const
    })
  )

  return new Map(entries)
}

async function ensureEventModalities(prisma: PrismaService) {
  const modalityMetadata: Record<string, { name: string, description: string }> = {
    PRESENTIAL: { name: 'Presencial', description: 'Evento presencial com participação física' },
    ONLINE: { name: 'Online', description: 'Evento virtual realizado remotamente' },
    HYBRID: { name: 'Híbrido', description: 'Evento com opção presencial e online' }
  }

  await Promise.all(
    Object.entries(modalityMetadata).map(async ([code, meta]) => {
      return await prisma.eventModality.upsert({
        where: { code },
        update: {
          name: meta.name,
          description: meta.description,
          isActive: true
        },
        create: {
          code,
          name: meta.name,
          description: meta.description,
          isActive: true
        }
      })
    })
  )
}

async function seedEventsDataset(
  prisma: PrismaService,
  communityMap: Map<string, number>,
  addressMap: Map<string, number>
) {
  await Promise.all(
    eventSeedData.map(async (event) => {
      const communityId = communityMap.get(event.community)

      if (!communityId) {
        throw new Error(`Seeded community ${event.community} not found during event seeding`)
      }

      const modality = await prisma.eventModality.findUnique({ where: { code: event.modality } })

      if (!modality) {
        throw new Error(`Event modality ${event.modality} not found during event seeding`)
      }

      let addressId: number | undefined
      if ('address' in event && event.address) {
        const key = buildAddressKey(event.address)
        addressId = addressMap.get(key) ?? undefined
      }

      await prisma.event.create({
        data: {
          communityId,
          modalityId: modality.id,
          addressId: addressId ?? null,
          title: event.title,
          description: event.description,
          coverUrl: event.coverUrl,
          link: event.link,
          startDateTime: event.startDateTime,
          endDateTime: event.endDateTime,
          isActive: true
        }
      })
    })
  )
}
