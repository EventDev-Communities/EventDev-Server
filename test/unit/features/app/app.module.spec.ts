import { PrismaService } from '@db/prisma.service'
import { AppModule } from '@module/app/app.module'
import { Test, TestingModule } from '@nestjs/testing'

describe('AppModule', () => {
  let module: TestingModule

  beforeAll(() => {
    process.env.MERCADO_PAGO_ACCESS_TOKEN = 'mock-token'
  })

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn()
      })
      .overrideProvider('REDIS_RATE_LIMIT')
      .useValue({
        on: jest.fn(),
        quit: jest.fn(),
        disconnect: jest.fn(),
        defineCommand: jest.fn()
      })
      .overrideProvider('IAuthAdapter')
      .useValue({
        addPermissionToRole: jest.fn()
      })
      .compile()
  })

  it('should be defined', () => {
    expect(module).toBeDefined()
  })
})
