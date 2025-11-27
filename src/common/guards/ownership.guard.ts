import type { IAuthUser } from '@common/interfaces/auth-user.interface'
import { OWNERSHIP_KEY, OwnershipType } from '@common/decorators/ownership.decorator'
import { UserRole } from '@common/enums/roles.enum'
import { PrismaService } from '@db/prisma.service'
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ownershipConfig = this.reflector.get<{ resourceType: OwnershipType, paramName: string }>(OWNERSHIP_KEY, context.getHandler())

    if (typeof ownershipConfig !== 'object' || ownershipConfig === null) {
      return true // No ownership check required
    }

    const request = context.switchToHttp().getRequest<{ user?: IAuthUser, params: Record<string, string> }>()
    const user = request.user
    const resourceId = Number.parseInt(String(request.params[ownershipConfig.paramName]), 10)

    if (typeof user !== 'object' || user === null) {
      return false
    }

    // Platform admin bypasses ownership checks
    if (user.roles.includes(UserRole.PLATFORM_ADMIN)) {
      return true
    }

    // Admin bypasses ownership checks
    if (user.roles.includes(UserRole.ADMIN)) {
      return true
    }

    // Check ownership based on resource type
    const isOwner = await this.checkOwnership(user, ownershipConfig.resourceType, resourceId)

    if (!isOwner) {
      throw new ForbiddenException('You do not have permission to access this resource')
    }

    return true
  }

  private async checkCommunityOwnership(communityId: number | undefined, resourceId: number): Promise<boolean> {
    return typeof communityId === 'number' && communityId === resourceId
  }

  private async checkEventOwnership(communityId: number | undefined, resourceId: number): Promise<boolean> {
    if (typeof communityId !== 'number') {
      return false
    }
    const event = await this.prisma.event.findUnique({
      where: { id: resourceId },
      select: { communityId: true }
    })
    return event?.communityId === communityId
  }

  private async checkTicketOwnership(communityId: number | undefined, resourceId: number): Promise<boolean> {
    if (typeof communityId !== 'number') {
      return false
    }
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: resourceId },
      include: { event: { select: { communityId: true } } }
    })
    return ticket?.event.communityId === communityId
  }

  private async checkOrderOwnership(userId: string, resourceId: number): Promise<boolean> {
    const order = await this.prisma.order.findUnique({
      where: { id: resourceId },
      select: { userId: true }
    })
    return order?.userId === Number.parseInt(userId)
  }

  private async checkOwnership(user: IAuthUser, resourceType: OwnershipType, resourceId: number): Promise<boolean> {
    switch (resourceType) {
      case OwnershipType.COMMUNITY:
        return await this.checkCommunityOwnership(user.communityId, resourceId)

      case OwnershipType.EVENT:
        return await this.checkEventOwnership(user.communityId, resourceId)

      case OwnershipType.TICKET:
        return await this.checkTicketOwnership(user.communityId, resourceId)

      case OwnershipType.ORDER:
        return await this.checkOrderOwnership(user.id, resourceId)

      default:
        return false
    }
  }
}
