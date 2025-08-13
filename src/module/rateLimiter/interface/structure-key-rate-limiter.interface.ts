export const AvailablePrefix = ['strike', 'ban', 'deny', 'rl'] as const
export type AvailablePrefixType = (typeof AvailablePrefix)[number]
export const AvailableDomains = ['global', 'auth', 'users', 'admin', 'public'] as const
export type AvailableDomainsType = (typeof AvailableDomains)[number]
export const AvailableIdentityUser = ['ip', 'userId', 'sub'] as const
export type AvailableIdentityUserType = (typeof AvailableIdentityUser)[number]
