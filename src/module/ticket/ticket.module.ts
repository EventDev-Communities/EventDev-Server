import { LoggerModule } from '@common/logger/logger.module'
import { TicketController } from '@module/ticket/ticket.controller'
import { TicketRepository } from '@module/ticket/ticket.repository'
import { TicketService } from '@module/ticket/ticket.service'
import { Module } from '@nestjs/common'

@Module({
  providers: [TicketRepository, TicketService],
  controllers: [TicketController],
  exports: [TicketService],
  imports: [LoggerModule]
})
export class TicketModule {}
