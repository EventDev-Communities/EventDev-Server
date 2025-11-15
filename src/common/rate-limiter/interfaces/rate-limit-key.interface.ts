/**
 * ESTRUTURA DE CHAVES DO REDIS PARA RATE LIMITING
 *
 * Define os tipos de prefixos, domínios e identificadores usados para
 * organizar as chaves no Redis de forma consistente.
 */

/**
 * Prefixos das chaves Redis
 * - rl: Rate Limit (contador de requisições)
 * - ban: Bloqueio temporário ativo
 * - deny: Lista de bloqueio permanente (blacklist)
 * - strike: Contador de infrações
 */
export const AvailablePrefix = ['rl', 'ban', 'deny', 'strike'] as const
export type AvailablePrefixType = (typeof AvailablePrefix)[number]

/**
 * Domínios da aplicação
 * Cada domínio pode ter sua própria política de rate limiting
 *
 * - global: Aplicado a todas as requisições
 * - auth: Rotas de autenticação (login, registro, etc)
 * - users: Rotas de usuários autenticados
 * - admin: Rotas administrativas
 * - public: Rotas públicas (sem autenticação)
 */
export const AvailableDomains = ['global', 'auth', 'users', 'admin', 'public'] as const
export type AvailableDomainsType = (typeof AvailableDomains)[number]

/**
 * Tipos de identificação do usuário/requisição
 *
 * - ip: Endereço IP do cliente (usado para requisições anônimas)
 * - userId: ID do usuário no banco de dados (para usuários autenticados)
 * - sub: Subject do JWT/SuperTokens (identificador único do usuário)
 */
export const AvailableIdentityUser = ['ip', 'userId', 'sub'] as const
export type AvailableIdentityUserType = (typeof AvailableIdentityUser)[number]

/**
 * Exemplos de formato de chaves geradas:
 *
 * Contador de requisições:
 * - rl:global:192.168.1.1
 * - rl:auth:user-123
 * - rl:admin:sub-abc-def
 *
 * Bloqueios temporários:
 * - ban:auth:192.168.1.1
 * - ban:global:user-456
 *
 * Bloqueios permanentes:
 * - deny:global:malicious-ip
 */
