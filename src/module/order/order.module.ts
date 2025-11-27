import { LoggerModule } from '@common/logger/logger.module'
import { EmailModule } from '@infrastructure/email/email.module'
import { OrderController } from '@module/order/order.controller'
import { OrderRepository } from '@module/order/order.repository'
import { OrderService } from '@module/order/order.service'
import { OrderWebhookController } from '@module/order/order.webhook.controller'
import { TicketModule } from '@module/ticket/ticket.module'
import { Module } from '@nestjs/common'

@Module({
  imports: [LoggerModule, TicketModule, EmailModule],
  controllers: [OrderController, OrderWebhookController],
  providers: [OrderService, OrderRepository],
  exports: [OrderService]
})
export class OrderModule {}
