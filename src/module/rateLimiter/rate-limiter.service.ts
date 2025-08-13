import { ForbiddenException, Inject, Injectable } from '@nestjs/common'
import Redis from 'ioredis'
import { Request } from 'express'
import { IRateLimitPolicyData } from './interface/rate-limiter-policy.interface'
import { AvailableDomainsType } from './interface/structure-key-rate-limiter.interface'
import { readFileSync } from 'fs'
import * as path from 'path'

@Injectable()
export class RateLimiterService {
  constructor(@Inject('REDIS_RATE_LIMIT') private readonly clientRedisLimiter: Redis) {}
  resolveIdentity(req: Request, extractor: (req: Request) => string): string {
    const id = extractor(req)
    if (!id) throw new Error('identidade não resolvida')
    return id
  }
  getGlobalPolicy(): IRateLimitPolicyData {
    return { limit: 5, windowMs: 60000, failClosed: false, domain: 'global', banSeconds: 60 }
  }
  getAuthPolicy() {
    return 'Possiveis configurações/abordagens de controle para o dominio de autenticação'
  }
  private async isDenyListed(identity: string, domain: AvailableDomainsType): Promise<boolean> {
    return (await this.clientRedisLimiter.exists(`deny:${domain}:${identity}`)) === 1
  }
  private async isBanActive(identity: string, domain: AvailableDomainsType) {
    return await this.clientRedisLimiter.ttl(`ban:${domain}:${identity}`)
  }
  async enforcePolicyCheckSlidingWindow(id: string, policy: IRateLimitPolicyData, domain: AvailableDomainsType): Promise<void> {
    const { banKey, zsetKey } = await this.checkRestrictions(id, domain, '')
    const { allowed, ttl } = await this.checkSlidingWindow(policy, banKey, zsetKey)
    if (!allowed) {
      throw new Error(`Muitas requisições acontecendo, tente novamente em:${ttl}s`)
    }
    return
  }
  async checkSlidingWindow(policy: IRateLimitPolicyData, banKey: string, zsetKey: string) {
    const { banSeconds, limit, windowMs } = policy
    const now = Date.now()
    const pathAbsolute = path.join(__dirname, '../', '../../../.lua/rate-limiting.lua')
    const scriptLua = readFileSync(pathAbsolute, 'utf-8')
    const sha1 = (await this.clientRedisLimiter.script('LOAD', scriptLua)) as string
    const [allowed, ttl] = (await this.clientRedisLimiter.evalsha(sha1, 2, zsetKey, banKey, now, windowMs, limit, banSeconds || 0)) as [
      number,
      number
    ]
    return { allowed: allowed === 1, ttl }
  }
  async checkRestrictions(identity: string, domain: AvailableDomainsType, pourpose: string) {
    const isDeny = await this.isDenyListed(identity, domain)
    if (isDeny) throw new ForbiddenException('Sujeito bloqueado')
    const banTtl = await this.isBanActive(identity, domain)
    if (banTtl > 0) throw new ForbiddenException(`Sujeito banido temporiariamente, tente novamente em:${banTtl}s`)
    return { banKey: `ban:${domain}:${identity}`, zsetKey: `${pourpose}:${domain}:${identity}` }
  }
}
