/**
 * CONFIGURAÇÃO DE RATE LIMITING
 *
 * Define políticas de controle de taxa de requisições para diferentes domínios da aplicação.
 *
 * Conceitos importantes:
 * - Rate Limiting: Limita quantas requisições um usuário pode fazer em um período
 * - Sliding Window: Janela de tempo que "desliza" conforme o tempo passa
 * - Ban: Bloqueio temporário após exceder o limite
 * - Domain: Área da aplicação (global, auth, etc)
 */

import { env } from '@configs/env'

export interface RateLimitPolicy {
  /** Máximo de requisições permitidas na janela de tempo */
  limit: number
  /** Tamanho da janela de tempo em milissegundos (ex: 60000 = 1 minuto) */
  windowMs: number
  /** Duração do bloqueio temporário em segundos quando limite é excedido */
  banSeconds: number
  /** Se true, bloqueia em caso de erro do Redis. Se false, permite passagem */
  failClosed: boolean
}

export interface RateLimitPolicies {
  /** Política global aplicada a todas as rotas por padrão */
  global: RateLimitPolicy
  /** Política para rotas públicas (mais permissiva) */
  public: RateLimitPolicy
  /** Política para autenticação (mais restritiva para prevenir brute force) */
  auth: RateLimitPolicy
  /** Política para ações de usuários autenticados */
  users: RateLimitPolicy
  /** Política para rotas administrativas (mais restritiva) */
  admin: RateLimitPolicy
}

/**
 * Configurações padrão de Rate Limiting
 *
 * Podem ser sobrescritas por variáveis de ambiente:
 * - RATE_LIMIT_GLOBAL: Limite global (padrão: 100 req/min)
 * - RATE_LIMIT_AUTH: Limite de autenticação (padrão: 5 req/min)
 * - RATE_LIMIT_PUBLIC: Limite público (padrão: 60 req/min)
 * - RATE_LIMIT_USERS: Limite usuários (padrão: 120 req/min)
 * - RATE_LIMIT_ADMIN: Limite admin (padrão: 200 req/min)
 */
export const RateLimitConfig: RateLimitPolicies = {
  global: {
    limit: env().RATE_LIMIT_GLOBAL,
    windowMs: 60000, // 1 minuto
    banSeconds: 60, // 1 minuto de ban
    failClosed: false // Em caso de erro, permite acesso
  },
  public: {
    limit: env().RATE_LIMIT_PUBLIC,
    windowMs: 60000,
    banSeconds: 30,
    failClosed: false
  },
  auth: {
    limit: env().RATE_LIMIT_AUTH,
    windowMs: 60000,
    banSeconds: 300, // 5 minutos de ban (prevenir brute force)
    failClosed: true // Bloqueia se Redis falhar (segurança)
  },
  users: {
    limit: env().RATE_LIMIT_USERS,
    windowMs: 60000,
    banSeconds: 60,
    failClosed: false
  },
  admin: {
    limit: env().RATE_LIMIT_ADMIN,
    windowMs: 60000,
    banSeconds: 120,
    failClosed: true
  }
}
