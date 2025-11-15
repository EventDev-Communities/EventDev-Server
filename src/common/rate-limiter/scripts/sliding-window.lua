---@diagnostic disable: undefined-global

--[[
  SLIDING WINDOW RATE LIMITER

  Controla taxa de requisições usando algoritmo de janela deslizante (sliding window).

  Como funciona:
  1. Cada requisição é registrada com seu timestamp em um Sorted Set do Redis
  2. A cada nova requisição, remove requisições antigas (fora da janela de tempo)
  3. Conta quantas requisições restam na janela
  4. Se exceder o limite, bloqueia temporariamente (ban)

  Exemplo prático:
  - Limite: 10 requisições por minuto
  - Usuário faz 10 requisições em 30 segundos → OK
  - Usuário tenta fazer a 11ª requisição → BLOQUEADO
  - Após 30 segundos, as primeiras requisições saem da janela
  - Usuário pode fazer novas requisições

  Retorno:
  - {1, 0} = Requisição PERMITIDA, sem bloqueio ativo
  - {0, N} = Requisição NEGADA, bloqueado por N segundos
]]

local function sliding_window_rate_limiter(requestsKey, banKey, currentTimestamp, windowSizeMs, maxRequests, banDurationSeconds)
  -- Passo 1: Verificar se usuário está temporariamente banido
  -- TTL (Time To Live) retorna quanto tempo falta para a chave expirar
  -- Se > 0, o ban ainda está ativo
  local remainingBanTime = redis.call('TTL', banKey)
  if remainingBanTime > 0 then
    return {0, remainingBanTime}  -- Bloqueado: retorna tempo restante de ban
  end

  -- Passo 2: Limpar requisições antigas (fora da janela deslizante)
  -- Calcula timestamp mínimo aceitável (agora - tamanho da janela)
  -- Exemplo: se janela é 60s e agora são 100s, remove tudo antes de 40s
  local oldestAllowedTimestamp = currentTimestamp - windowSizeMs
  redis.call('ZREMRANGEBYSCORE', requestsKey, 0, oldestAllowedTimestamp)

  -- Passo 3: Contar quantas requisições estão na janela atual
  -- ZCARD retorna quantidade de elementos no Sorted Set
  local currentRequestCount = redis.call('ZCARD', requestsKey)

  -- Passo 4: Verificar se excedeu o limite
  if currentRequestCount >= maxRequests then
    -- Limite atingido! Aplicar ban temporário se configurado
    if banDurationSeconds > 0 then
      -- SETEX cria chave temporária que expira automaticamente
      -- Formato: ban:dominio:identificador com TTL de banDurationSeconds
      redis.call('SETEX', banKey, banDurationSeconds, '1')
      return {0, banDurationSeconds}  -- Bloqueado: retorna duração do ban
    end
    -- Ban desabilitado (banDurationSeconds = 0), apenas bloqueia sem penalidade
    return {0, 0}  -- Bloqueado: sem tempo de ban adicional
  end

  -- Passo 5: Registrar esta requisição
  -- ZADD adiciona elemento ao Sorted Set com score = timestamp
  -- Isso permite ordenação cronológica e remoção eficiente de itens antigos
  redis.call('ZADD', requestsKey, currentTimestamp, tostring(currentTimestamp))

  -- Passo 6: Definir expiração automática da chave
  -- PEXPIRE define TTL em milissegundos
  -- Previne crescimento infinito de memória: após a janela, dados são limpos
  redis.call('PEXPIRE', requestsKey, windowSizeMs)

  -- Requisição permitida!
  return {1, 0}  -- Permitido: sem bloqueio
end

-- Execução do script
-- KEYS[1]: Chave do Sorted Set contendo timestamps das requisições
--          Formato: "rl:dominio:identificador" (rl = rate limit)
-- KEYS[2]: Chave do ban temporário
--          Formato: "ban:dominio:identificador"
-- ARGV[1]: Timestamp atual em milissegundos (Date.now())
-- ARGV[2]: Tamanho da janela em milissegundos (ex: 60000 = 1 minuto)
-- ARGV[3]: Máximo de requisições permitidas na janela (ex: 100)
-- ARGV[4]: Duração do ban em segundos quando limite é excedido (ex: 60)
return sliding_window_rate_limiter(
  KEYS[1],
  KEYS[2],
  tonumber(ARGV[1]),
  tonumber(ARGV[2]),
  tonumber(ARGV[3]),
  tonumber(ARGV[4])
)
