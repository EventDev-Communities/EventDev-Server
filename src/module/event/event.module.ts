import { Module } from "@nestjs/common";
import { EventRepository } from "./event.repository";
import { EventService } from "./event.service";
import { EventController } from "./event.controller";
import { CommunityModule } from "../community/community.module";
import { AddressModule } from "../address/address.module";

@Module({
    providers: [EventRepository, EventService],
    controllers: [EventController],
    exports: [],
    imports: [CommunityModule, AddressModule]
})

export class EventModule {}