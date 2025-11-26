import { LoggerService } from '@common/logger/logger.service'
import { OrderService } from '@module/order/order.service'
import { Body, Controller, ForbiddenException, Headers, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { PublicAccess } from 'supertokens-nestjs'

interface MercadoPagoWebhookBody {
  type: string
  data: {
    id: string
  }
  [key: string]: unknown
}

@ApiTags('webhooks')
@Controller('webhooks')
export class OrderWebhookController {
  constructor(
    @Inject(OrderService) private readonly orderService: OrderService,
    @Inject(LoggerService) private readonly logger: LoggerService
  ) {}

  @PublicAccess()
  @Post('mercadopago')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receber notificações do Mercado Pago' })
  async handleMercadoPagoWebhook(
    @Body() body: MercadoPagoWebhookBody,
    @Headers('x-signature') signature: string,
    @Headers('x-request-id') requestId: string
  ) {
    this.logger.log('Webhook received', { body, signature, requestId })

    if (!signature || !requestId) {
      this.logger.warn('Missing signature or request-id headers')
      throw new ForbiddenException('Missing signature or request-id headers')
    }

    const resourceId = body.data?.id
    if (!resourceId) {
      this.logger.warn('Webhook body missing data.id')
      return { status: 'ok' }
    }

    const isValid = this.orderService.validateWebhookSignature(resourceId, requestId, signature)
    if (!isValid) {
      this.logger.warn('Invalid webhook signature', { resourceId, requestId, signature })
      throw new ForbiddenException('Invalid webhook signature')
    }

    if (body.type === 'payment') {
      await this.orderService.handlePaymentWebhook(resourceId)
    }

    return { status: 'ok' }
  }
}
