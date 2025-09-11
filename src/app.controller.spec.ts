import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaService } from './prisma/prisma.service'

describe('AppController', () => {
  let appController: AppController

  beforeEach(async () => {
    const mockPrismaService = {
      $connect: jest.fn().mockResolvedValue(undefined)
    }

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile()

    appController = app.get<AppController>(AppController)
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
