import { Module } from '@nestjs/common'
import { CommunityRepository } from './community.repository'
import { CommunityService } from './community.service'
import { CommunityController } from './community.controller'

@Module({
    providers: [CommunityRepository, CommunityService],
    controllers: [CommunityController],
    exports: [CommunityService]
})
export class CommunityModule { }
