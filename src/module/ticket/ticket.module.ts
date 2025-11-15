import { LoggerModule } from '@common/logger/logger.module'
import { AddressModule } from '@module/address/address.module'
import { CommunityModule } from '@module/community/community.module'
import { EventModule } from '@module/event/event.module'
import { TicketController } from '@module/ticket/ticket.controller'
import { TicketRepository } from '@module/ticket/ticket.repository'
import { TicketService } from '@module/ticket/ticket.service'
import { Module } from '@nestjs/common'

@Module({
  providers: [TicketRepository, TicketService],
  controllers: [TicketController],
  exports: [],
  imports: [LoggerModule, CommunityModule, AddressModule, EventModule]
})
export class TicketModule {}
