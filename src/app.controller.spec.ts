import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@prisma/prisma.service'
import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'

describe('AppController', () => {
  let appController: AppController
  let moduleRef: TestingModule

  beforeEach(async () => {
    const mockPrismaService = {
      $connect: jest.fn().mockResolvedValue(undefined)
    }

    moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile()

    appController = moduleRef.get<AppController>(AppController)
  })

  afterEach(async () => {
    await moduleRef.close()
  })

  describe('root', () => {
    it('should return API stats!', () => {
      expect(appController.getApiStats()).toStrictEqual({
        status: 'online',
        api: 'eventdev-api',
        version: 'v1'
      })
    })
  })
})
