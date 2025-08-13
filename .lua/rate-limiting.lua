---@diagnostic disable: undefined-global

-- Função principal de controle de rate limiting via Sliding Window
local function sliding_window_control(zkey, banKey, now, window, limit, banSeconds)
  
  -- Checa se existe um ban ativo; se sim, retorna 0 e TTL restante
  local banTtl = redis.call('TTL', banKey)
  if banTtl > 0 then
    return {0, banTtl}
  end

  -- Calcula a pontuação mínima da janela de tempo (janela deslizante), essa pontuação é calculada atráves do evento (ação que pode ser contabilizada)
  local minScore = now - window
  -- Remove entradas antigas fora da janela de tempo
  redis.call('ZREMRANGEBYSCORE', zkey, 0, minScore)

  -- Conta quantos eventos permanecem na janela atual
  local count = redis.call('ZCARD', zkey)

  -- Se o limite for atingido, aplica ban (se configurado) e retorna 0
  if count >= limit then
    if banSeconds > 0 then
      redis.call('SETEX', banKey, banSeconds, '1') -- cria chave de ban temporária
      return {0, banSeconds}                       -- retorna que não é permitido + TTL do ban
    end
    return {0, 0}                                  -- retorna que não é permitido, sem ban
  end

  -- Adiciona o evento atual ao sorted set com timestamp como score
  redis.call('ZADD', zkey, now, tostring(now))
  -- Define expiração para o zset igual ao tamanho da janela (evita crescimento infinito)
  redis.call('PEXPIRE', zkey, window)

  -- Retorna 1 para permitir a ação e 0 para TTL (sem bloqueio)
  return {1, 0}
end

-- Executa a função usando KEYS e ARGV passados pelo EVAL/EVALSHA
return sliding_window_control(
  KEYS[1],                  -- chave do sorted set que armazena timestamps
  KEYS[2],                  -- chave para o ban temporário
  tonumber(ARGV[1]),        -- timestamp atual em ms
  tonumber(ARGV[2]),        -- tamanho da janela (window) em ms
  tonumber(ARGV[3]),        -- limite de eventos na janela
  tonumber(ARGV[4])         -- tempo de ban em segundos (se ultrapassar o limite)
)
