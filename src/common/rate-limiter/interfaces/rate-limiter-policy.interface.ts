/**
 * INTERFACES DE POLÍTICAS DE RATE LIMITING
 *
 * Define a estrutura de dados para configuração de rate limiting.
 */

import { AvailableDomainsType } from '@common/rate-limiter/interfaces/rate-limit-key.interface'

/**
 * Dados de uma política de rate limiting
 *
 * Exemplo prático:
 * {
 *   limit: 10,           // Máximo 10 requisições
 *   windowMs: 60000,     // Por minuto (60.000 ms)
 *   banSeconds: 300,     // Ban de 5 minutos se exceder
 *   failClosed: true,    // Bloqueia se Redis falhar
 *   domain: 'auth'       // Aplicado ao domínio de autenticação
 * }
 */
export interface IRateLimitPolicyData {
  /** Número máximo de requisições permitidas na janela de tempo */
  limit: number

  /** Tamanho da janela de tempo em milissegundos */
  windowMs: number

  /** Duração do bloqueio temporário em segundos (opcional) */
  banSeconds?: number

  /**
   * Comportamento em caso de falha do Redis:
   * - true: Bloqueia requisição (fail-closed, mais seguro)
   * - false: Permite requisição (fail-open, mais disponibilidade)
   */
  failClosed: boolean

  /** Domínio da aplicação ao qual esta política se aplica */
  domain: AvailableDomainsType
}

/**
 * Coleção completa de políticas de rate limiting
 * Cada domínio tem sua própria configuração
 */
export interface IRateLimitPolicy {
  /** Política global (padrão para todas as rotas) */
  global: IRateLimitPolicyData

  /** Política para rotas públicas */
  public: IRateLimitPolicyData

  /** Política para rotas de autenticação (mais restritiva) */
  auth: IRateLimitPolicyData

  /** Política para usuários autenticados */
  users: IRateLimitPolicyData

  /** Política para rotas administrativas */
  admin: IRateLimitPolicyData
}
