/**
 * CONFIGURAÇÃO DO CLIENTE REDIS PARA RATE LIMITING
 *
 * Redis é um banco de dados em memória (cache) usado para armazenar:
 * - Contadores de requisições
 * - Bloqueios temporários (bans)
 * - Listas de bloqueio permanente
 *
 * Por que usar Redis para rate limiting?
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
export const RedisRateLimitProvider: Provider = {
  provide: 'REDIS_RATE_LIMIT',
  useFactory: () =>
    new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      db: Number(process.env.REDIS_RATE_LIMIT_DB) || 1,

      // Configurações de conexão
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
}
