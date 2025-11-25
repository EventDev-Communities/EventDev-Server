import { AppModule } from '@module/app/app.module'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

describe('Diagnostic E2E Test', () => {
  let app: INestApplication

  afterAll(async () => {
    if (app) {
      await app.close()
    }
  })

  it('should initialize app without errors', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    expect(app).toBeDefined()
  }, 60000) // 60s timeout
})
