import { LoggerModule } from '@common/logger/logger.module'
import { AddressModule } from '@module/address/address.module'
import { CommunityModule } from '@module/community/community.module'
import { EventController } from '@module/event/event.controller'
import { EventRepository } from '@module/event/event.repository'
import { EventService } from '@module/event/event.service'
import { Module } from '@nestjs/common'

@Module({
  providers: [EventRepository, EventService],
  controllers: [EventController],
  exports: [],
  imports: [LoggerModule, CommunityModule, AddressModule]
})
export class EventModule {}
