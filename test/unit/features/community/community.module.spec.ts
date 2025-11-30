import { PrismaService } from '@db/prisma.service'
import { EmailService } from '@infrastructure/email/email.service'
import { CommunityModule } from '@module/community/community.module'
import { CommunityService } from '@module/community/community.service'
import { Global, Module } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

@Global()
@Module({
  providers: [{ provide: PrismaService, useValue: {} }],
  exports: [PrismaService]
})
class MockPrismaModule {}

describe('CommunityModule', () => {
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CommunityModule, MockPrismaModule]
    })
      .overrideProvider(EmailService)
      .useValue({})
      .compile()
  })

  it('should be defined', () => {
    expect(module).toBeDefined()
    expect(module.get(CommunityService)).toBeDefined()
  })
})
