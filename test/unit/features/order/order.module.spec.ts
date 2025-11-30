import { PrismaService } from '@db/prisma.service'
import { EmailService } from '@infrastructure/email/email.service'
import { OrderModule } from '@module/order/order.module'
import { OrderService } from '@module/order/order.service'
import { TicketService } from '@module/ticket/ticket.service'
import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

@Global()
@Module({
  providers: [{ provide: PrismaService, useValue: {} }],
  exports: [PrismaService]
})
class MockPrismaModule {}

describe('OrderModule', () => {
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        OrderModule,
        MockPrismaModule,
        ConfigModule.forRoot({ isGlobal: true, load: [() => ({ MERCADO_PAGO_ACCESS_TOKEN: 'mock-token' })] })
      ]
    })
      .overrideProvider(TicketService)
      .useValue({})
      .overrideProvider(EmailService)
      .useValue({})
      .compile()
  })

  it('should be defined', () => {
    expect(module).toBeDefined()
    expect(module.get(OrderService)).toBeDefined()
  })
})
