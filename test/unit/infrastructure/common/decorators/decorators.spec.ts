/* eslint-disable sonarjs/no-nested-functions */
import { CurrentUser } from '@common/decorators/current-user.decorator'
import { OWNERSHIP_KEY, OwnershipType, RequireOwnership } from '@common/decorators/ownership.decorator'
import { PERMISSIONS_KEY, RequirePermissions } from '@common/decorators/permissions.decorator'
import { Roles, ROLES_KEY } from '@common/decorators/roles.decorator'
import { Permission } from '@common/enums/permissions.enum'
import { UserRole } from '@common/enums/roles.enum'
import { ExecutionContext } from '@nestjs/common'
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants'

describe('Decorators', () => {
  describe('CurrentUser', () => {
    class TestController {
      test(@CurrentUser() user: any) {}
    }

    it('should return request.user', () => {
      const mockUser = { id: '123', email: 'test@test.com' }
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({ user: mockUser })
        })
      } as ExecutionContext

      const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestController, 'test')

      if (!metadata) {
        throw new Error('Metadata not found')
      }

      const key = Object.keys(metadata)[0]
      const factory = metadata[key].factory

      const result = factory(null, mockContext)
      expect(result).toEqual(mockUser)
    })
  })

  describe('RequirePermissions', () => {
    it('should set permissions metadata', () => {
      class TestClass {
        @RequirePermissions(Permission.EVENT_CREATE)
        testMethod(this: void) {}
      }

      const metadata = Reflect.getMetadata(PERMISSIONS_KEY, TestClass.prototype.testMethod)
      expect(metadata).toEqual([Permission.EVENT_CREATE])
    })
  })

  describe('Roles', () => {
    it('should set roles metadata', () => {
      class TestClass {
        @Roles(UserRole.ADMIN)
        testMethod(this: void) {}
      }

      const metadata = Reflect.getMetadata(ROLES_KEY, TestClass.prototype.testMethod)
      expect(metadata).toEqual([UserRole.ADMIN])
    })
  })

  describe('RequireOwnership', () => {
    it('should set ownership metadata with default paramName', () => {
      class TestClass {
        @RequireOwnership(OwnershipType.EVENT)
        testMethod(this: void) {}
      }

      const metadata = Reflect.getMetadata(OWNERSHIP_KEY, TestClass.prototype.testMethod)
      expect(metadata).toEqual({ resourceType: OwnershipType.EVENT, paramName: 'id' })
    })

    it('should set ownership metadata with custom paramName', () => {
      class TestClass {
        @RequireOwnership(OwnershipType.COMMUNITY, 'communityId')
        testMethod(this: void) {}
      }

      const metadata = Reflect.getMetadata(OWNERSHIP_KEY, TestClass.prototype.testMethod)
      expect(metadata).toEqual({ resourceType: OwnershipType.COMMUNITY, paramName: 'communityId' })
    })
  })
})
