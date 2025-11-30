import { OwnershipType } from '@common/decorators/ownership.decorator'
import { UserRole } from '@common/enums/roles.enum'
import { OwnershipGuard } from '@common/guards/ownership.guard'
import { PrismaService } from '@db/prisma.service'
import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'

describe('OwnershipGuard', () => {
  let guard: OwnershipGuard
  let reflector: Reflector

  const mockPrismaService = {
    event: {
      findUnique: jest.fn()
    },
    ticket: {
      findUnique: jest.fn()
    },
    order: {
      findUnique: jest.fn()
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnershipGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn()
          }
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile()

    guard = module.get<OwnershipGuard>(OwnershipGuard)
    reflector = module.get<Reflector>(Reflector)
  })

  it('should be defined', () => {
    expect(guard).toBeDefined()
  })

  describe('canActivate', () => {
    let context: ExecutionContext
    let request: any

    beforeEach(() => {
      request = {
        user: {
          id: '1',
          roles: [],
          communityId: 1
        },
        params: {
          id: '100'
        }
      }
      context = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(request)
        })
      } as unknown as ExecutionContext
    })

    it('should return true if no ownership config is present', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue(null)
      const result = await guard.canActivate(context)
      expect(result).toBe(true)
    })

    it('should return true if user is PLATFORM_ADMIN', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue({ resourceType: OwnershipType.EVENT, paramName: 'id' })
      request.user.roles = [UserRole.PLATFORM_ADMIN]
      const result = await guard.canActivate(context)
      expect(result).toBe(true)
    })

    it('should return true if user is ADMIN', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue({ resourceType: OwnershipType.EVENT, paramName: 'id' })
      request.user.roles = [UserRole.ADMIN]
      const result = await guard.canActivate(context)
      expect(result).toBe(true)
    })

    it('should return false if user is missing', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue({ resourceType: OwnershipType.EVENT, paramName: 'id' })
      request.user = null
      const result = await guard.canActivate(context)
      expect(result).toBe(false)
    })

    describe('COMMUNITY ownership', () => {
      it('should return true if user owns the community', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue({ resourceType: OwnershipType.COMMUNITY, paramName: 'id' })
        request.params.id = '1' // Matches user.communityId = 1
        const result = await guard.canActivate(context)
        expect(result).toBe(true)
      })

      it('should throw ForbiddenException if user does not own the community', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue({ resourceType: OwnershipType.COMMUNITY, paramName: 'id' })
        request.params.id = '2' // Different from user.communityId
        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException)
      })
    })

    describe('EVENT ownership', () => {
      it('should return true if event belongs to user community', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue({ resourceType: OwnershipType.EVENT, paramName: 'id' })
        mockPrismaService.event.findUnique.mockResolvedValue({ communityId: 1 })
        const result = await guard.canActivate(context)
        expect(result).toBe(true)
      })

      it('should throw ForbiddenException if event does not belong to user community', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue({ resourceType: OwnershipType.EVENT, paramName: 'id' })
        mockPrismaService.event.findUnique.mockResolvedValue({ communityId: 2 })
        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException)
      })
    })

    describe('TICKET ownership', () => {
      it('should return true if ticket event belongs to user community', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue({ resourceType: OwnershipType.TICKET, paramName: 'id' })
        mockPrismaService.ticket.findUnique.mockResolvedValue({ event: { communityId: 1 } })
        const result = await guard.canActivate(context)
        expect(result).toBe(true)
      })

      it('should throw ForbiddenException if ticket event does not belong to user community', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue({ resourceType: OwnershipType.TICKET, paramName: 'id' })
        mockPrismaService.ticket.findUnique.mockResolvedValue({ event: { communityId: 2 } })
        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException)
      })
    })

    describe('ORDER ownership', () => {
      it('should return true if order belongs to user', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue({ resourceType: OwnershipType.ORDER, paramName: 'id' })
        request.user.id = '123'
        mockPrismaService.order.findUnique.mockResolvedValue({ userId: 123 })
        const result = await guard.canActivate(context)
        expect(result).toBe(true)
      })

      it('should throw ForbiddenException if order does not belong to user', async () => {
        jest.spyOn(reflector, 'get').mockReturnValue({ resourceType: OwnershipType.ORDER, paramName: 'id' })
        request.user.id = '123'
        mockPrismaService.order.findUnique.mockResolvedValue({ userId: 456 })
        await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException)
      })
    })
  })
})
