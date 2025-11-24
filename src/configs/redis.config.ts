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
const shouldLogRedisEvents = process.env.NODE_ENV !== 'test'

export const RedisRateLimitProvider: Provider = {
  provide: 'REDIS_RATE_LIMIT',
  useFactory: () => {
    const client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      db: Number(process.env.REDIS_RATE_LIMIT_DB) || 1,

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
        if (err.message.includes(targetError)) {
          return true // Reconecta se Redis estiver em modo read-only
        }
        return false
      }
    })

    if (shouldLogRedisEvents) {
      console.warn('[RedisRateLimit] creating Redis client', {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        db: Number(process.env.REDIS_RATE_LIMIT_DB) || 1
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
