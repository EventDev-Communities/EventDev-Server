import { PrismaService } from '@db/prisma.service'
import { EmailService } from '@infrastructure/email/email.service'
import { AuthModule } from '@module/auth/auth.module'
import { AuthService } from '@module/auth/auth.service'
import { CommunityService } from '@module/community/community.service'
import { Test, TestingModule } from '@nestjs/testing'

describe('AuthModule', () => {
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule]
    })
      .overrideProvider(CommunityService)
      .useValue({})
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(EmailService)
      .useValue({})
      .overrideProvider('IAuthAdapter')
      .useValue({})
      .compile()
  })

  it('should be defined', () => {
    expect(module).toBeDefined()
    expect(module.get(AuthService)).toBeDefined()
  })
})
