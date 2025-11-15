import { SetMetadata } from '@nestjs/common'

export enum OwnershipType {
  COMMUNITY = 'community',
  EVENT = 'event',
  TICKET = 'ticket',
  ORDER = 'order'
}

export const OWNERSHIP_KEY = 'ownership'
export const RequireOwnership = (resourceType: OwnershipType, paramName: string = 'id') => SetMetadata(OWNERSHIP_KEY, { resourceType, paramName })
