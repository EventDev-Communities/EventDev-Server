/**
 * CONFIGURAÇÃO DO CLIENTE REDIS PARA RATE LIMITING
 *
 * Overview:
 *
 * Redis é um banco de dados em memória (cache) usado para armazenar:
 * - Contadores de requisições
 * - Bloqueios temporários (bans)
 * - Listas de bloqueio permanente
 *
 * Decisão Técnica:
 *
 * Por que escolhemos usar Redis para rate limiting?
 * - MUITO rápido (operações em microssegundos)
 * - Estruturas de dados otimizadas (Sorted Sets, TTL automático)
 * - Suporta scripts Lua para operações atômicas
 * - Escalável horizontalmente
 */

import { env } from '@configs/env'
import { Provider } from '@nestjs/common'
import Redis from 'ioredis'

/**
 * Provider do NestJS para injetar cliente Redis
 *
 * Configuração:
 * - host: Endereço do servidor Redis (ex: localhost, redis-cache)
 * - port: Porta do Redis (padrão: 6379)
 * - db: Database number (0-15, separar por funcionalidade)
 *
 * Variáveis de ambiente necessárias:
 * - REDIS_HOST: Host do Redis
 * - REDIS_PORT: Porta do Redis
 * - REDIS_RATE_LIMIT_DB: Database específico para rate limiting (padrão: 1)
 */
const shouldLogRedisEvents = env().NODE_ENV !== 'test'

export const RedisRateLimitProvider: Provider = {
  provide: 'REDIS_RATE_LIMIT',
  useFactory: () => {
    const client = new Redis({
      host: env().REDIS_HOST,
      port: env().REDIS_PORT,
      db: env().REDIS_RATE_LIMIT_DB,

      retryStrategy: (times: number) => {
        // Reconecta com backoff exponencial (máximo 3 segundos)
        const delay = Math.min(times * 50, 3000)
        return delay
      },

      // Timeout de comandos (previne travamentos)
      commandTimeout: 5000,

      // Habilita modo offline queue (armazena comandos se desconectado)
      enableOfflineQueue: true,

      // Reconectar automaticamente
      reconnectOnError: (err) => {
        const targetError = 'READONLY'
        return err.message.includes(targetError)
      }
    })

    if (shouldLogRedisEvents) {
      console.warn('[RedisRateLimit] creating Redis client', {
        host: env().REDIS_HOST,
        port: env().REDIS_PORT,
        db: env().REDIS_RATE_LIMIT_DB
      })
    }

    client.on('connect', () => {
      if (shouldLogRedisEvents) {
        console.warn('[RedisRateLimit] connect event fired')
      }
    })

    client.on('ready', () => {
      if (shouldLogRedisEvents) {
        console.warn('[RedisRateLimit] ready event fired')
      }
    })

    client.on('error', (error) => {
      console.error('[RedisRateLimit] error event', error?.message)
    })

    client.on('end', () => {
      if (shouldLogRedisEvents) {
        console.warn('[RedisRateLimit] connection ended')
      }
    })

    return client
  }
}
