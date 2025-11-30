import { CustomSuperTokensAuthGuard } from '@common/guards/supertokens-auth.guard'
import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

describe('CustomSuperTokensAuthGuard', () => {
  let guard: CustomSuperTokensAuthGuard

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomSuperTokensAuthGuard]
    }).compile()

    guard = module.get<CustomSuperTokensAuthGuard>(CustomSuperTokensAuthGuard)
  })

  it('should be defined', () => {
    expect(guard).toBeDefined()
  })

  describe('canActivate', () => {
    it('should return true when super.canActivate returns true', async () => {
      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
          getResponse: jest.fn().mockReturnValue({})
        })
      } as unknown as ExecutionContext

      // Mocking super.canActivate
      // Since we can't easily mock super calls, we might need to spy on the prototype or just assume it works if we mock the dependencies.
      // However, SuperTokensAuthGuard likely uses static methods or global state.
      // For unit testing this specific class, we are mostly interested in the error handling logic added on top.

      // Let's mock the super method if possible, or just test the error handling by forcing an error.
      // Since CustomSuperTokensAuthGuard extends SuperTokensAuthGuard, we can try to spy on it.

      jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate').mockResolvedValue(true)

      const result = await guard.canActivate(context)
      expect(result).toBe(true)
    })

    it('should throw UnauthorizedException when super.canActivate throws a session error', async () => {
      const context = {} as ExecutionContext
      const error = { message: 'Session does not exist' }

      jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate').mockRejectedValue(error)

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException)
    })

    it('should throw UnauthorizedException when super.canActivate throws an UNAUTHORISED error', async () => {
      const context = {} as ExecutionContext
      const error = { type: 'UNAUTHORISED' }

      jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate').mockRejectedValue(error)

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException)
    })

    it('should rethrow other errors', async () => {
      const context = {} as ExecutionContext
      const error = new Error('Some other error')

      jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate').mockRejectedValue(error)

      await expect(guard.canActivate(context)).rejects.toThrow(Error)
    })
  })
})
