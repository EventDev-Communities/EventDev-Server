import {
  AvailableDomainsType,
  AvailableIdentityUserType,
  AvailablePrefixType
} from 'src/module/rateLimiter/interface/structure-key-rate-limiter.interface'

export interface IRateLimiter {
  limit: number
  duration: number
  strategy?: 'fixed' | 'sliding' | 'backoff'
  prefix: AvailablePrefixType
  domains: AvailableDomainsType
  identityUser: AvailableIdentityUserType
}
