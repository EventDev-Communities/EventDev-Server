import { PrismaService } from '@db/prisma.service'
import { AddressService } from '@module/address/address.service'
import { CommunityService } from '@module/community/community.service'
import { EventModule } from '@module/event/event.module'
import { EventService } from '@module/event/event.service'
import { Global, Module } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

@Global()
@Module({
  providers: [{ provide: PrismaService, useValue: {} }],
  exports: [PrismaService]
})
class MockPrismaModule {}

describe('EventModule', () => {
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [EventModule, MockPrismaModule]
    })
      .overrideProvider(CommunityService)
      .useValue({})
      .overrideProvider(AddressService)
      .useValue({})
      .compile()
  })

  it('should be defined', () => {
    expect(module).toBeDefined()
    expect(module.get(EventService)).toBeDefined()
  })
})
