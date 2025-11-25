import { LoggerModule } from '@common/logger/logger.module'
import { EmailModule } from '@infrastructure/email/email.module'
import { CommunityController } from '@module/community/community.controller'
import { CommunityRepository } from '@module/community/community.repository'
import { CommunityService } from '@module/community/community.service'
import { Module } from '@nestjs/common'

@Module({
  imports: [LoggerModule, EmailModule],
  providers: [CommunityRepository, CommunityService],
  controllers: [CommunityController],
  exports: [CommunityService]
})
export class CommunityModule {}
