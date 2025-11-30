import { LoggerModule } from '@common/logger/logger.module'
import { PrismaModule } from '@db/prisma.module'
import { PrismaService } from '@db/prisma.service'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

describe('PrismaModule', () => {
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        PrismaModule,
        LoggerModule,
        ConfigModule.forRoot({ isGlobal: true, load: [() => ({ DATABASE_URL: 'postgresql://...' })] })
      ]
    }).compile()
  })

  it('should be defined', () => {
    expect(module).toBeDefined()
    expect(module.get(PrismaService)).toBeDefined()
  })
})
