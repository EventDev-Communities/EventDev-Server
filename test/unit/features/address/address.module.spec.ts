import { LoggerModule } from '@common/logger/logger.module'
import { PrismaService } from '@db/prisma.service'
import { AddressModule } from '@module/address/address.module'
import { AddressService } from '@module/address/address.service'
import { Global, Module } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

@Global()
@Module({
  providers: [{ provide: PrismaService, useValue: {} }],
  exports: [PrismaService]
})
class MockPrismaModule {}

describe('AddressModule', () => {
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AddressModule, MockPrismaModule, LoggerModule]
    })
      .compile()
  })

  it('should be defined', () => {
    expect(module).toBeDefined()
    expect(module.get(AddressService)).toBeDefined()
  })
})
