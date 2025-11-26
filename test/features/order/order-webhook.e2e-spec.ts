import { createHmac } from 'node:crypto'
import { PrismaService } from '@db/prisma.service'
import { AppModule } from '@module/app/app.module'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Payment } from 'mercadopago'
import request from 'supertest'

describe('Order Webhook E2E', () => {
  let app: INestApplication
  let prismaService: PrismaService
  let configService: ConfigService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    prismaService = app.get<PrismaService>(PrismaService)
    configService = app.get<ConfigService>(ConfigService)
    await app.init()
  })

  afterAll(async () => {
    // Clean up
    await prismaService.order.deleteMany()
    await prismaService.user.deleteMany()
    await prismaService.$disconnect()
    await app.close()
  })

  it('should update order status to CONFIRMED and create tickets when payment is approved', async () => {
    // 1. Create User
    const user = await prismaService.user.create({
      data: {
        email: `test-webhook-${Date.now()}@test.com`,
        supertokensId: `st-id-${Date.now()}`
      }
    })

    // 2. Setup Dependencies (Community, Event, TicketType)
    const community = await prismaService.community.create({
      data: {
        name: 'Test Community',
        supertokensId: `st-comm-${Date.now()}`
      }
    })

    let modality = await prismaService.eventModality.findFirst({ where: { code: 'PRESENTIAL' } })
    if (!modality) {
      modality = await prismaService.eventModality.create({
        data: { code: 'PRESENTIAL', name: 'Presencial' }
      })
    }

    const event = await prismaService.event.create({
      data: {
        communityId: community.id,
        modalityId: modality.id,
        title: 'Test Event',
        description: 'Test Description',
        startDateTime: new Date(),
        endDateTime: new Date()
      }
    })

    const ticketType = await prismaService.ticketType.create({
      data: {
        eventId: event.id,
        name: 'General Admission',
        price: 50,
        quantity: 100
      }
    })

    let orderItemType = await prismaService.orderItemType.findFirst({ where: { code: 'TICKET' } })
    if (!orderItemType) {
      orderItemType = await prismaService.orderItemType.create({
        data: { code: 'TICKET', name: 'Ticket' }
      })
    }

    let ticketStatusConfirmed = await prismaService.ticketStatus.findFirst({ where: { code: 'CONFIRMED' } })
    if (!ticketStatusConfirmed) {
      ticketStatusConfirmed = await prismaService.ticketStatus.create({
        data: { code: 'CONFIRMED', name: 'Confirmed' }
      })
    }

    // 3. Create Order with Items
    let orderStatusPending = await prismaService.orderStatus.findFirst({ where: { code: 'PENDING' } })
    if (!orderStatusPending) {
      orderStatusPending = await prismaService.orderStatus.create({
        data: { code: 'PENDING', name: 'Pending' }
      })
    }

    const orderStatusConfirmed = await prismaService.orderStatus.findFirst({ where: { code: 'CONFIRMED' } })
    if (!orderStatusConfirmed) {
      await prismaService.orderStatus.create({
        data: { code: 'CONFIRMED', name: 'Confirmed' }
      })
    }

    const order = await prismaService.order.create({
      data: {
        userId: user.id,
        totalAmount: 100,
        orderStatusId: orderStatusPending.id,
        paymentMethod: 'pix',
        items: {
          create: {
            itemTypeId: orderItemType.id,
            itemId: ticketType.id,
            quantity: 2,
            unitPrice: 50,
            totalPrice: 100
          }
        }
      }
    })

    // 4. Mock Payment.get
    const paymentId = '123456789'
    const mockPaymentResponse = {
      id: Number(paymentId),
      status: 'approved',
      status_detail: 'accredited',
      metadata: {
        order_id: String(order.id),
        user_id: user.id
      }
    }

    jest.spyOn(Payment.prototype, 'get').mockResolvedValue(mockPaymentResponse as any)

    // Generate Signature
    const secret = configService.get<string>('MERCADO_PAGO_WEBHOOK_SECRET') || 'test-secret'
    const requestId = 'req-123'
    const ts = '1234567890'
    const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`
    const hmac = createHmac('sha256', secret)
    hmac.update(manifest)
    const v1 = hmac.digest('hex')
    const signature = `ts=${ts},v1=${v1}`

    // 5. Call Webhook
    await request(app.getHttpServer())
      .post('/webhooks/mercadopago')
      .set('x-signature', signature)
      .set('x-request-id', requestId)
      .send({
        data: { id: paymentId },
        type: 'payment'
      })
      .expect(HttpStatus.OK)

    // 6. Assert Order Status
    const updatedOrder = await prismaService.order.findUnique({
      where: { id: order.id },
      include: { orderStatus: true }
    })
    expect(updatedOrder?.orderStatus.code).toBe('CONFIRMED')

    // 7. Assert Tickets Created
    const tickets = await prismaService.ticket.findMany({
      where: { userId: user.id, eventId: event.id }
    })
    expect(tickets).toHaveLength(2)
    expect(tickets[0].ticketStatusId).toBe(ticketStatusConfirmed.id)
  })

  it('should update order status to CANCELLED when payment is rejected', async () => {
    // 1. Create User
    const user = await prismaService.user.create({
      data: {
        email: `test-webhook-rejected-${Date.now()}@test.com`,
        supertokensId: `st-id-rejected-${Date.now()}`
      }
    })

    // 2. Create Order
    const orderStatusPending = await prismaService.orderStatus.findFirst({ where: { code: 'PENDING' } })
    if (!orderStatusPending) {
      throw new Error('PENDING status not found')
    }

    const orderStatusCancelled = await prismaService.orderStatus.findFirst({ where: { code: 'CANCELLED' } })
    if (!orderStatusCancelled) {
      await prismaService.orderStatus.create({
        data: { code: 'CANCELLED', name: 'Cancelled' }
      })
    }

    const order = await prismaService.order.create({
      data: {
        userId: user.id,
        totalAmount: 100,
        orderStatusId: orderStatusPending.id,
        paymentMethod: 'pix'
      }
    })

    // 3. Mock Payment.get
    const paymentId = '987654321'
    const mockPaymentResponse = {
      id: Number(paymentId),
      status: 'rejected',
      status_detail: 'cc_rejected_other_reason',
      metadata: {
        order_id: String(order.id),
        user_id: user.id
      }
    }

    jest.spyOn(Payment.prototype, 'get').mockResolvedValue(mockPaymentResponse as any)

    // Generate Signature
    const secret = configService.get<string>('MERCADO_PAGO_WEBHOOK_SECRET') || 'test-secret'
    const requestId = 'req-456'
    const ts = '1234567890'
    const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`
    const hmac = createHmac('sha256', secret)
    hmac.update(manifest)
    const v1 = hmac.digest('hex')
    const signature = `ts=${ts},v1=${v1}`

    // 4. Call Webhook
    await request(app.getHttpServer())
      .post('/webhooks/mercadopago')
      .set('x-signature', signature)
      .set('x-request-id', requestId)
      .send({
        data: { id: paymentId },
        type: 'payment'
      })
      .expect(HttpStatus.OK)

    // 5. Assert
    const updatedOrder = await prismaService.order.findUnique({
      where: { id: order.id },
      include: { orderStatus: true }
    })
    expect(updatedOrder?.orderStatus.code).toBe('CANCELLED')
  })
})
