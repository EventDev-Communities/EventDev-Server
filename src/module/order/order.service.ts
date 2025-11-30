import { createHmac } from 'node:crypto'
import { LoggerService } from '@common/logger/logger.service'
import { env } from '@configs/env'
import { PrismaService } from '@db/prisma.service'
import { EmailService } from '@infrastructure/email/email.service'
import { CreateOrderDto } from '@module/order/dto/create-order.dto'
import { OrderRepository } from '@module/order/order.repository'
import { TicketService } from '@module/ticket/ticket.service'
import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Order, OrderStatus, Prisma, Ticket, TicketType } from '@prisma/client'
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'
import { PreferenceRequest } from 'mercadopago/dist/clients/preference/commonTypes'

interface MercadoPagoPaymentResponse {
  id: number
  status: string
  status_detail: string
  metadata: {
    order_id: string
    user_id: number
  }
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string
      qr_code_base64?: string
      ticket_url?: string
    }
  }
}

interface ITicketService {
  getTicketTypeById: (id: number) => Promise<TicketType>
  decrementStock: (ticketTypeId: number, quantity: number, tx?: Prisma.TransactionClient) => Promise<TicketType>
  createTicket: (
    data: {
      eventId: number
      userId: number
      ticketTypeId: number
      value: number
    },
    tx?: Prisma.TransactionClient
  ) => Promise<Ticket>
}

@Injectable()
export class OrderService {
  private client: MercadoPagoConfig
  private preferenceClient: Preference
  private paymentClient: Payment

  constructor(
    @Inject(OrderRepository) private readonly orderRepository: OrderRepository,
    @Inject(TicketService) private readonly ticketService: ITicketService,
    @Inject(LoggerService) private readonly logger: LoggerService,
    @Inject(PrismaService) private readonly prismaService: PrismaService,
    @Inject(EmailService) private readonly emailService: EmailService,
    private readonly configService: ConfigService
  ) {
    const accessToken = this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN')
    if (!accessToken) {
      this.logger.warn('MERCADO_PAGO_ACCESS_TOKEN not found in env')
    }

    if (accessToken) {
      this.logger.log(`Initializing Mercado Pago with token: ${accessToken.substring(0, 10)}...`)
    }

    this.client = new MercadoPagoConfig({
      accessToken: accessToken || '',
      options: { timeout: 5000 }
    })
    this.preferenceClient = new Preference(this.client)
    this.paymentClient = new Payment(this.client)
  }

  async createOrder(userId: number, data: CreateOrderDto) {
    this.logger.log('Creating order', { userId, ticketTypeId: data.ticketTypeId })

    const ticketType = await this.ticketService.getTicketTypeById(data.ticketTypeId)

    if (ticketType.quantity < data.quantity) {
      throw new BadRequestException('Quantidade indisponível')
    }

    const unitPrice = Number(ticketType.price)
    const totalAmount = unitPrice * data.quantity

    const pendingStatus = await this.orderRepository.getOrderStatusByCode('PENDING')
    const ticketItemType = await this.orderRepository.getOrderItemTypeByCode('TICKET')

    if (!pendingStatus || !ticketItemType) {
      throw new InternalServerErrorException('Configuration error: Status or ItemType not found')
    }

    const order = await this.orderRepository.createOrder(userId, {
      totalAmount,
      paymentMethod: data.paymentMethodId,
      statusId: pendingStatus.id
    })

    await this.orderRepository.createOrderItem(
      order.id,
      ticketItemType.id,
      ticketType.id,
      data.quantity,
      unitPrice
    )

    return await this.processPayment(order, data, ticketType.name, userId, pendingStatus)
  }

  private async processPayment(
    order: Order,
    data: CreateOrderDto,
    description: string,
    userId: number,
    initialStatus: OrderStatus
  ) {
    try {
      // If total amount is 0, we don't need to create a payment preference
      if (Number(order.totalAmount) === 0) {
        this.logger.log('Processing free order', { orderId: order.id })
        const transactionId = `FREE-${order.id}-${Date.now()}`

        await this.updateOrderStatusAfterPayment(order.id, 'approved', initialStatus, transactionId)

        return {
          orderId: order.id,
          status: 'approved',
          statusDetail: 'accredited',
          transactionId,
          initPoint: null,
          sandboxInitPoint: null
        }
      }

      const preferenceResponse = await this.createPaymentTransaction(order, data, description)
      const { id: preferenceId, init_point: initPoint, sandbox_init_point: sandboxInitPoint } = preferenceResponse

      this.logger.log('Preference created', { preferenceId })

      // We use the preference ID as the transaction ID initially
      await this.updateOrderStatusAfterPayment(order.id, 'pending', initialStatus, String(preferenceId))

      return {
        orderId: order.id,
        status: 'pending',
        statusDetail: 'pending_payment',
        transactionId: preferenceId,
        initPoint,
        sandboxInitPoint
      }
    } catch (error) {
      const trace = error instanceof Error ? error.stack : String(error)
      this.logger.error('Payment processing error', trace)
      await this.handlePaymentError(order.id, error)

      const errorMessage = this.extractErrorMessage(error)

      throw new BadRequestException(`Falha ao processar pagamento: ${errorMessage}`)
    }
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }

    if (typeof error !== 'object' || error === null) {
      return String(error)
    }

    const mpError = error as { message?: string, cause?: unknown[] }

    if (!mpError.message) {
      return JSON.stringify(error)
    }

    if (mpError.message === 'Unauthorized use of live credentials') {
      return `${mpError.message} (Ambiente de Produção detectado. Use Credenciais de Teste para dados fictícios)`
    }

    return mpError.message
  }

  private async createPaymentTransaction(order: Order, data: CreateOrderDto, description: string) {
    // Mercado Pago requires a public HTTPS URL for webhooks.
    // In development (localhost), we can't use localhost directly.
    // We should use a tunneling service (ngrok) or a placeholder if just testing creation.
    // For now, if we are in dev and using localhost, we'll use a dummy valid URL to pass validation
    // or rely on the env var if it's set to a tunnel.
    let notificationUrl = `${env().WEBSITE_DOMAIN}/api/v1/webhooks/mercadopago`
    let backUrl = `${env().WEBSITE_DOMAIN}/checkout/status`

    if (notificationUrl.includes('localhost')) {
      // Fallback for local development to pass MP validation
      // This means you won't receive webhooks locally unless you configure a tunnel
      notificationUrl = 'https://api.eventdev.org/api/v1/webhooks/mercadopago'
      backUrl = 'https://api.eventdev.org/checkout/status'
      this.logger.warn(`Localhost detected. Using dummy webhook URL: ${notificationUrl}`)
    }

    const unitPrice = Number(order.totalAmount.toString()) / data.quantity

    const preferenceData: PreferenceRequest = {
      items: [
        {
          id: String(data.ticketTypeId),
          title: description,
          description: `Ticket para ${description}`,
          quantity: data.quantity,
          unit_price: unitPrice,
          currency_id: 'BRL'
        }
      ],
      payer: {
        email: data.payerEmail,
        name: data.payerFirstName,
        surname: data.payerLastName,
        identification: {
          type: data.payerIdentification.type,
          number: data.payerIdentification.number.replace(/\D/g, '')
        }
      },
      back_urls: {
        success: backUrl,
        failure: backUrl,
        pending: backUrl
      },
      auto_return: 'approved',
      notification_url: notificationUrl,
      external_reference: String(order.id),
      statement_descriptor: 'EVENTDEV',
      metadata: {
        order_id: order.id,
        user_id: order.userId
      },
      payment_methods: {
        excluded_payment_types: [],
        installments: 12 // Permite até 12x
      },
      expires: true,
      date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString() // Expira em 30 minutos (bom para PIX)
    }

    this.logger.debug('Creating preference in Mercado Pago', preferenceData)
    const response = await this.preferenceClient.create({ body: preferenceData })

    if (!response.id) {
      throw new Error('Failed to create preference')
    }

    return {
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point
    }
  }

  async handlePaymentWebhook(paymentId: string) {
    try {
      const paymentResponse = await this.paymentClient.get({ id: paymentId })
      const payment = paymentResponse as unknown as MercadoPagoPaymentResponse
      const status = payment.status
      const metadata = payment.metadata
      const orderId = metadata?.order_id

      if (!orderId) {
        this.logger.warn('Order ID not found in payment metadata', { paymentId })
        return
      }

      const order = await this.orderRepository.getOrderByIdWithItems(Number(orderId))
      if (!order) {
        this.logger.warn('Order not found', { orderId })
        return
      }

      await this.updateOrderStatusAfterPayment(order.id, status, order.orderStatus, String(payment.id))
    } catch (error) {
      this.logger.error('Error handling payment webhook', error instanceof Error ? error.message : String(error))
    }
  }

  private async updateOrderStatusAfterPayment(
    orderId: number,
    status: string | undefined,
    initialStatus: OrderStatus,
    transactionId: string
  ) {
    if (status === 'approved') {
      const approvedStatus = await this.orderRepository.getOrderStatusByCode('CONFIRMED')
      if (approvedStatus) {
        // Use a variable to store tickets created in the transaction
        let createdTickets: Ticket[] = []

        await this.prismaService.$transaction(async (tx) => {
          createdTickets = await this.processApprovedOrder(orderId, tx)
          await this.orderRepository.updateOrderStatus(orderId, approvedStatus.id, transactionId, tx)
        })

        // Send email after transaction commit
        if (createdTickets.length > 0) {
          // Fire and forget email sending to not block response
          void this.sendTicketsEmail(orderId, createdTickets)
        }
        return
      }
    } else if (status === 'rejected') {
      const rejectedStatus = await this.orderRepository.getOrderStatusByCode('CANCELLED')
      if (rejectedStatus) {
        await this.orderRepository.updateOrderStatus(orderId, rejectedStatus.id, transactionId)
        return
      }
    }

    await this.orderRepository.updateOrderStatus(orderId, initialStatus.id, transactionId)
  }

  private async processApprovedOrder(orderId: number, tx: Prisma.TransactionClient): Promise<Ticket[]> {
    const order = await this.orderRepository.getOrderByIdWithItems(orderId, tx)
    if (!order) {
      return []
    }

    const ticketItems = order.items.filter((item) => item.itemType.code === 'TICKET')
    const createdTickets: Ticket[] = []

    await Promise.all(
      ticketItems.map(async (item) => {
        const ticketType = await this.ticketService.getTicketTypeById(item.itemId)
        await this.ticketService.decrementStock(ticketType.id, item.quantity, tx)

        const promises = Array.from({ length: item.quantity }).map(async () => {
          const ticket = await this.ticketService.createTicket(
            {
              eventId: ticketType.eventId,
              userId: order.userId,
              ticketTypeId: ticketType.id,
              value: Number(item.unitPrice)
            },
            tx
          )
          createdTickets.push(ticket)
          return ticket
        })
        await Promise.all(promises)
      })
    )
    return createdTickets
  }

  private async sendTicketsEmail(orderId: number, tickets: Ticket[]) {
    try {
      const order = await this.orderRepository.getOrderByIdWithItems(orderId)
      if (!order) {
        return
      }

      const ticketsWithDetails = await Promise.all(
        tickets.map(async (t) => {
          return await this.prismaService.ticket.findUnique({
            where: { id: t.id },
            include: {
              event: true,
              ticketType: true,
              user: true
            }
          })
        })
      )

      const emailData = ticketsWithDetails
        .filter((t): t is NonNullable<typeof t> => t !== null)
        .map((t) => ({
          id: t.id,
          eventName: t.event.title,
          ticketType: t.ticketType.name,
          participantName: t.user.email // Or name if we had it
        }))

      await this.emailService.sendTicketEmail(order.user.email, emailData)
    } catch (error) {
      this.logger.error('Error sending ticket email', error instanceof Error ? error.message : String(error))
    }
  }

  private async handlePaymentError(orderId: number, error: unknown) {
    this.logger.error('Error processing payment', error instanceof Error ? error.message : String(error))
    const cancelledStatus = await this.orderRepository.getOrderStatusByCode('CANCELLED')
    if (cancelledStatus) {
      await this.orderRepository.updateOrderStatus(orderId, cancelledStatus.id)
    }
  }

  validateWebhookSignature(id: string, requestId: string, signature: string): boolean {
    const parts = signature.split(',')
    let ts: string | undefined
    let v1: string | undefined

    parts.forEach((part) => {
      const [key, value] = part.split('=')
      if (key && value) {
        const trimmedKey = key.trim()
        const trimmedValue = value.trim()
        if (trimmedKey === 'ts') {
          ts = trimmedValue
        }
        if (trimmedKey === 'v1') {
          v1 = trimmedValue
        }
      }
    })

    if (!ts || !v1) {
      return false
    }

    const secret = this.configService.get<string>('MERCADO_PAGO_WEBHOOK_SECRET')
    if (!secret) {
      this.logger.error('MERCADO_PAGO_WEBHOOK_SECRET not configured')
      return false
    }

    const manifest = `id:${id};request-id:${requestId};ts:${ts};`
    const hmac = createHmac('sha256', secret)
    hmac.update(manifest)
    const sha = hmac.digest('hex')

    return sha === v1
  }
}
