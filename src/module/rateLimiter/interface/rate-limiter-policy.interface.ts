import { AvailableDomainsType } from './structure-key-rate-limiter.interface'

export interface IRateLimitPolicyData {
  limit: number
  windowMs: number
  banSeconds?: number
  failClosed: boolean
  domain: AvailableDomainsType
}

export interface IRateLimitPolicy {
  global: IRateLimitPolicyData
  public: IRateLimitPolicyData
  auth: IRateLimitPolicyData
}
