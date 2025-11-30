import { PrismaService } from '@db/prisma.service'
import { TicketModule } from '@module/ticket/ticket.module'
import { TicketService } from '@module/ticket/ticket.service'
import { Global, Module } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

@Global()
@Module({
  providers: [{ provide: PrismaService, useValue: {} }],
  exports: [PrismaService]
})
class MockPrismaModule {}

describe('TicketModule', () => {
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TicketModule, MockPrismaModule]
    }).compile()
  })

  it('should be defined', () => {
    expect(module).toBeDefined()
    expect(module.get(TicketService)).toBeDefined()
  })
})
