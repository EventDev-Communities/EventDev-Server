import { LoggerModule } from '@common/logger/logger.module'
import { LoggerService } from '@common/logger/logger.service'
import { Test, TestingModule } from '@nestjs/testing'

describe('LoggerModule', () => {
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [LoggerModule]
    }).compile()
  })

  it('should be defined', () => {
    expect(module).toBeDefined()
    expect(module.get(LoggerService)).toBeDefined()
  })
})
