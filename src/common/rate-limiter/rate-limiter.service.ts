/**
 * SERVIÇO DE RATE LIMITING
 *
 * Controla a taxa de requisições usando Redis e algoritmo de sliding window.
 *
 * Funcionalidades:
 * - Limita número de requisições por tempo
 * - Bloqueia temporariamente usuários que excedem limites
 * - Mantém listas de bloqueio permanente
 * - Executa validações usando scripts Lua otimizados
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { AvailableDomainsType } from '@common/rate-limiter/interfaces/rate-limit-key.interface'
import { IRateLimitPolicyData } from '@common/rate-limiter/interfaces/rate-limiter-policy.interface'
import { RateLimitConfig } from '@configs/rate-limit.config'
import { ForbiddenException, Inject, Injectable, OnApplicationShutdown } from '@nestjs/common'
import { Request } from 'express'
import { Redis } from 'ioredis'

/**
 * Resultado da execução do script Lua de rate limiting
 */
interface LuaScriptResult {
  /** true se requisição é permitida, false se bloqueada */
  allowed: boolean
  /** Tempo restante de bloqueio em segundos (0 se não bloqueado) */
  ttl: number
}

@Injectable()
export class RateLimiterService implements OnApplicationShutdown {
  /** Caminho para o script Lua de sliding window */
  private readonly luaScriptPath: string

  /** SHA1 hash do script Lua carregado no Redis (cache) */
  private luaScriptSha: string | null = null

  constructor(@Inject('REDIS_RATE_LIMIT') private readonly redisClient: Redis) {
    this.luaScriptPath = join(process.cwd(), 'src', 'common', 'rate-limiter', 'scripts', 'sliding-window.lua')
  }

  /**
   * Extrai identificador único da requisição
   *
   * @param req - Objeto da requisição Express
   * @param extractor - Função que extrai o ID (ex: req => req.ip)
   * @returns Identificador único (IP, userID, etc)
   * @throws Error se não conseguir resolver identidade
   *
   * @example
   * // Identificar por IP
   * const id = resolveIdentity(req, (r) => r.ip)
   *
   * // Identificar por user ID autenticado
   * const id = resolveIdentity(req, (r) => r.user?.id)
   */
  resolveIdentity(req: Request, extractor: (req: Request) => string): string {
    const identity = extractor(req)
    if (!identity) {
      throw new Error('Não foi possível identificar o usuário/requisição')
    }
    return identity
  }

  /**
   * Retorna política global de rate limiting
   * Aplicada por padrão a todas as rotas
   */
  getGlobalPolicy(): IRateLimitPolicyData {
    return {
      ...RateLimitConfig.global,
      domain: 'global'
    }
  }

  /**
   * Retorna política de autenticação
   * Mais restritiva para prevenir ataques de brute force
   */
  getAuthPolicy(): IRateLimitPolicyData {
    return {
      ...RateLimitConfig.auth,
      domain: 'auth'
    }
  }

  /**
   * Retorna política para usuários autenticados
   */
  getUsersPolicy(): IRateLimitPolicyData {
    return {
      ...RateLimitConfig.users,
      domain: 'users'
    }
  }

  /**
   * Retorna política pública
   * Mais permissiva para rotas abertas
   */
  getPublicPolicy(): IRateLimitPolicyData {
    return {
      ...RateLimitConfig.public,
      domain: 'public'
    }
  }

  /**
   * Retorna política administrativa
   */
  getAdminPolicy(): IRateLimitPolicyData {
    return {
      ...RateLimitConfig.admin,
      domain: 'admin'
    }
  }

  /**
   * Verifica se identidade está na lista de bloqueio permanente
   *
   * @param identity - Identificador único (IP, userID, etc)
   * @param domain - Domínio da aplicação
   * @returns true se está bloqueado permanentemente
   *
   * @example
   * const isBlocked = await isDenyListed('192.168.1.1', 'global')
   */
  private async isDenyListed(identity: string, domain: AvailableDomainsType): Promise<boolean> {
    const key = `deny:${domain}:${identity}`
    return (await this.redisClient.exists(key)) === 1
  }

  /**
   * Verifica se há bloqueio temporário ativo
   *
   * @param identity - Identificador único
   * @param domain - Domínio da aplicação
   * @returns Segundos restantes de ban (0 ou -1 se não banido, >0 se banido)
   *
   * @example
   * const ttl = await isBanActive('user-123', 'auth')
   * if (ttl > 0) {
   *   // Bloqueado por mais X segundos
   * }
   */
  private async isBanActive(identity: string, domain: AvailableDomainsType): Promise<number> {
    const key = `ban:${domain}:${identity}`
    return await this.redisClient.ttl(key)
  }

  /**
   * Aplica política de rate limiting usando sliding window
   *
   * Este é o método principal que você deve chamar para verificar rate limits.
   *
   * @param identity - Identificador único (IP, userID, etc)
   * @param policy - Política de rate limiting a ser aplicada
   * @param domain - Domínio da aplicação
   * @param purpose - Propósito/contexto adicional (opcional, ex: 'login', 'api')
   * @throws Error se rate limit for excedido
   *
   * @example
   * try {
   *   await enforcePolicyCheckSlidingWindow('192.168.1.1', getGlobalPolicy(), 'global')
   *   // Requisição permitida, continue
   * } catch (error) {
   *   // Bloqueado: retornar 429 Too Many Requests
   * }
   */
  async enforcePolicyCheckSlidingWindow(
    identity: string,
    policy: IRateLimitPolicyData,
    domain: AvailableDomainsType,
    purpose = 'rl'
  ): Promise<void> {
    // Gera chaves e valida restrições (deny list, ban ativo)
    const { banKey, requestsKey } = await this.checkRestrictions(identity, domain, purpose)

    // Executa algoritmo de sliding window no Redis
    const { allowed, ttl } = await this.checkSlidingWindow(policy, banKey, requestsKey)

    // Se não permitido, lança erro com tempo de espera
    if (!allowed) {
      throw new Error(`Muitas requisições. Aguarde ${ttl} segundos antes de tentar novamente.`)
    }
  }

  /**
   * Executa algoritmo de sliding window usando script Lua
   *
   * O script Lua garante atomicidade (tudo ou nada) das operações no Redis.
   *
   * @param policy - Política com limites e configurações
   * @param banKey - Chave Redis para armazenar ban temporário
   * @param requestsKey - Chave Redis para sorted set de timestamps
   * @returns Resultado indicando se permitido e TTL de bloqueio
   */
  private async checkSlidingWindow(
    policy: IRateLimitPolicyData,
    banKey: string,
    requestsKey: string
  ): Promise<LuaScriptResult> {
    const { banSeconds, limit, windowMs } = policy
    const now = Date.now()

    // Carrega script Lua no Redis (apenas primeira vez, depois usa cache)
    if (!this.luaScriptSha) {
      const scriptContent = readFileSync(this.luaScriptPath, 'utf-8')
      this.luaScriptSha = (await this.redisClient.script('LOAD', scriptContent)) as string
    }

    // Executa script usando EVALSHA (mais rápido que EVAL)
    // Retorna [allowed, ttl] onde allowed é 1 ou 0
    const [allowedFlag, ttl] = (await this.redisClient.evalsha(
      this.luaScriptSha,
      2, // Número de KEYS
      requestsKey, // KEYS[1]
      banKey, // KEYS[2]
      now, // ARGV[1]
      windowMs, // ARGV[2]
      limit, // ARGV[3]
      banSeconds || 0 // ARGV[4]
    )) as [number, number]

    return {
      allowed: allowedFlag === 1,
      ttl
    }
  }

  /**
   * Valida restrições antes de verificar rate limit
   *
   * Verifica em ordem:
   * 1. Se está na deny list (blacklist permanente) → Bloqueia
   * 2. Se tem ban temporário ativo → Bloqueia
   * 3. Se passou nas validações → Retorna chaves para próximo passo
   *
   * @param identity - Identificador único
   * @param domain - Domínio da aplicação
   * @param purpose - Contexto adicional para namespace das chaves
   * @returns Chaves Redis formatadas para uso
   * @throws ForbiddenException se bloqueado (deny ou ban)
   *
   * @example
   * const keys = await checkRestrictions('192.168.1.1', 'global', 'api')
   * // keys = { banKey: 'ban:global:192.168.1.1', requestsKey: 'rl:global:192.168.1.1' }
   */
  private async checkRestrictions(
    identity: string,
    domain: AvailableDomainsType,
    purpose: string
  ): Promise<{ banKey: string, requestsKey: string }> {
    // Verifica deny list (bloqueio permanente)
    const isDenied = await this.isDenyListed(identity, domain)
    if (isDenied) {
      throw new ForbiddenException('Acesso bloqueado permanentemente')
    }

    // Verifica ban temporário
    const banTtl = await this.isBanActive(identity, domain)
    if (banTtl > 0) {
      throw new ForbiddenException(
        `Bloqueio temporário ativo. Aguarde ${banTtl} segundos antes de tentar novamente.`
      )
    }

    // Retorna chaves formatadas para Redis
    return {
      banKey: `ban:${domain}:${identity}`,
      requestsKey: `${purpose}:${domain}:${identity}`
    }
  }

  async onApplicationShutdown() {
    if (this.redisClient.status === 'end') {
      return
    }

    try {
      await this.redisClient.quit()
    } catch {
      this.redisClient.disconnect()
    }
  }
}
