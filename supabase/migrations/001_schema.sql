-- ============================================================
-- FigurinhaAI - Copa do Mundo FIFA 2026™
-- Schema inicial
-- ============================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================
-- PERFIS DE USUÁRIOS
-- ============================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  total_stickers INTEGER DEFAULT 0,
  pasted_count INTEGER DEFAULT 0,
  duplicate_count INTEGER DEFAULT 0,
  completion_percent NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles visíveis para todos" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Usuário edita próprio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuário cria próprio perfil" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- FIGURINHAS (MASTER - 980 total)
-- ============================================================
CREATE TABLE stickers (
  id SERIAL PRIMARY KEY,
  number INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  section TEXT NOT NULL,        -- ex: 'apresentacao', 'grupo_a', 'fase_final'
  section_name TEXT NOT NULL,   -- ex: 'Apresentação', 'Grupo A', 'Fase Final'
  type TEXT NOT NULL CHECK (type IN ('regular', 'especial')),
  group_name TEXT,              -- 'A' a 'L'
  team TEXT,                    -- Nome do time
  team_code TEXT,               -- Código ISO ex: 'BRA', 'ARG'
  team_flag TEXT,               -- Emoji da bandeira
  player_name TEXT,
  player_position TEXT,         -- 'GK', 'DEF', 'MID', 'FWD', 'CT', 'TEC'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para figurinhas
CREATE INDEX idx_stickers_section ON stickers(section);
CREATE INDEX idx_stickers_type ON stickers(type);
CREATE INDEX idx_stickers_team ON stickers(team);
CREATE INDEX idx_stickers_number ON stickers(number);

-- ============================================================
-- COLEÇÃO DO USUÁRIO
-- ============================================================
CREATE TABLE user_stickers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  sticker_id INTEGER REFERENCES stickers(id) NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity >= 0),
  is_pasted BOOLEAN DEFAULT FALSE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, sticker_id)
);

-- RLS para user_stickers
ALTER TABLE user_stickers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê própria coleção" ON user_stickers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuário gerencia própria coleção" ON user_stickers
  FOR ALL USING (auth.uid() = user_id);

-- Índices
CREATE INDEX idx_user_stickers_user ON user_stickers(user_id);
CREATE INDEX idx_user_stickers_sticker ON user_stickers(sticker_id);
CREATE INDEX idx_user_stickers_pasted ON user_stickers(user_id, is_pasted);

-- ============================================================
-- PONTOS DE TROCA
-- ============================================================
CREATE TABLE trade_points (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'Brasil',
  latitude NUMERIC(10,8) NOT NULL,
  longitude NUMERIC(11,8) NOT NULL,
  location GEOGRAPHY(POINT, 4326),  -- PostGIS para queries geoespaciais
  type TEXT NOT NULL CHECK (type IN ('oficial', 'comunidade')),
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT TRUE,
  upvotes INTEGER DEFAULT 0,
  schedule TEXT,                    -- ex: "Sáb e Dom, 9h-17h"
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para trade_points
ALTER TABLE trade_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pontos visíveis para todos" ON trade_points
  FOR SELECT USING (is_active = true);

CREATE POLICY "Usuário autenticado cria ponto" ON trade_points
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Criador edita ponto" ON trade_points
  FOR UPDATE USING (auth.uid() = created_by);

-- Índice geoespacial
CREATE INDEX idx_trade_points_location ON trade_points USING GIST(location);
CREATE INDEX idx_trade_points_type ON trade_points(type);

-- Trigger para atualizar coluna location quando lat/lng muda
CREATE OR REPLACE FUNCTION update_trade_point_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::GEOGRAPHY;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trade_points_location_trigger
  BEFORE INSERT OR UPDATE ON trade_points
  FOR EACH ROW EXECUTE FUNCTION update_trade_point_location();

-- ============================================================
-- SESSÕES DE TROCA (usuários ativos em pontos)
-- ============================================================
CREATE TABLE trade_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  trade_point_id UUID REFERENCES trade_points(id),
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  is_active BOOLEAN DEFAULT TRUE,
  available_stickers INTEGER[],   -- IDs das figurinhas para trocar
  needed_stickers INTEGER[],      -- IDs das figurinhas que precisa
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para trade_sessions
ALTER TABLE trade_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sessões visíveis para todos" ON trade_sessions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Usuário gerencia própria sessão" ON trade_sessions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- PROPOSTAS DE TROCA
-- ============================================================
CREATE TABLE trade_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  responder_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  requester_offers INTEGER[] NOT NULL,   -- sticker IDs que o solicitante oferece
  requester_wants INTEGER[] NOT NULL,    -- sticker IDs que o solicitante quer
  ai_score NUMERIC(5,2),                 -- score de compatibilidade (IA)
  ai_summary TEXT,                       -- análise da IA
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceita', 'recusada', 'concluida', 'cancelada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para trade_requests
ALTER TABLE trade_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê suas trocas" ON trade_requests
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = responder_id);

CREATE POLICY "Usuário cria proposta" ON trade_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Participante atualiza proposta" ON trade_requests
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = responder_id);

-- ============================================================
-- FUNÇÕES ÚTEIS
-- ============================================================

-- Função para buscar usuários próximos (raio em km)
CREATE OR REPLACE FUNCTION get_nearby_traders(
  p_lat NUMERIC,
  p_lng NUMERIC,
  p_radius_km NUMERIC DEFAULT 5
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  available_stickers INTEGER[],
  needed_stickers INTEGER[],
  distance_km NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ts.user_id,
    p.username,
    p.display_name,
    p.avatar_url,
    ts.available_stickers,
    ts.needed_stickers,
    ROUND(
      ST_Distance(
        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::GEOGRAPHY,
        ST_SetSRID(ST_MakePoint(ts.longitude, ts.latitude), 4326)::GEOGRAPHY
      ) / 1000.0, 2
    ) AS distance_km
  FROM trade_sessions ts
  JOIN profiles p ON p.id = ts.user_id
  WHERE
    ts.is_active = true
    AND ts.user_id != auth.uid()
    AND ts.last_seen > NOW() - INTERVAL '30 minutes'
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::GEOGRAPHY,
      ST_SetSRID(ST_MakePoint(ts.longitude, ts.latitude), 4326)::GEOGRAPHY,
      p_radius_km * 1000
    )
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para calcular compatibilidade de troca
CREATE OR REPLACE FUNCTION calculate_trade_match(
  p_my_user_id UUID,
  p_other_user_id UUID
)
RETURNS TABLE (
  i_offer INTEGER[],    -- o que eu ofereço que o outro precisa
  i_need INTEGER[],     -- o que o outro tem que eu preciso
  match_score NUMERIC
) AS $$
DECLARE
  v_my_duplicates INTEGER[];
  v_other_duplicates INTEGER[];
  v_my_needed INTEGER[];
  v_other_needed INTEGER[];
  v_i_offer INTEGER[];
  v_i_need INTEGER[];
  v_score NUMERIC;
BEGIN
  -- Minhas repetidas
  SELECT ARRAY_AGG(sticker_id) INTO v_my_duplicates
  FROM user_stickers
  WHERE user_id = p_my_user_id AND quantity > 1;

  -- Figurinhas que eu não tenho
  SELECT ARRAY_AGG(s.id) INTO v_my_needed
  FROM stickers s
  WHERE s.id NOT IN (
    SELECT sticker_id FROM user_stickers WHERE user_id = p_my_user_id AND is_pasted = true
  );

  -- Repetidas do outro
  SELECT ARRAY_AGG(sticker_id) INTO v_other_duplicates
  FROM user_stickers
  WHERE user_id = p_other_user_id AND quantity > 1;

  -- Figurinhas que o outro não tem
  SELECT ARRAY_AGG(s.id) INTO v_other_needed
  FROM stickers s
  WHERE s.id NOT IN (
    SELECT sticker_id FROM user_stickers WHERE user_id = p_other_user_id AND is_pasted = true
  );

  -- Posso oferecer: minhas repetidas que o outro precisa
  SELECT ARRAY_AGG(x) INTO v_i_offer
  FROM UNNEST(v_my_duplicates) x
  WHERE x = ANY(v_other_needed);

  -- Preciso: repetidas do outro que eu preciso
  SELECT ARRAY_AGG(x) INTO v_i_need
  FROM UNNEST(v_other_duplicates) x
  WHERE x = ANY(v_my_needed);

  -- Score = média de matches / total possível
  v_score := (
    COALESCE(ARRAY_LENGTH(v_i_offer, 1), 0) +
    COALESCE(ARRAY_LENGTH(v_i_need, 1), 0)
  )::NUMERIC / GREATEST(1, (
    COALESCE(ARRAY_LENGTH(v_my_needed, 1), 1) +
    COALESCE(ARRAY_LENGTH(v_other_needed, 1), 1)
  )) * 100;

  RETURN QUERY SELECT v_i_offer, v_i_need, ROUND(v_score, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar stats do perfil quando user_stickers muda
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_total INTEGER;
  v_pasted INTEGER;
  v_duplicates INTEGER;
  v_completion NUMERIC;
BEGIN
  v_user_id := COALESCE(NEW.user_id, OLD.user_id);

  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE is_pasted = true),
    SUM(GREATEST(quantity - 1, 0))
  INTO v_total, v_pasted, v_duplicates
  FROM user_stickers
  WHERE user_id = v_user_id;

  v_completion := ROUND((v_pasted::NUMERIC / 980) * 100, 2);

  UPDATE profiles SET
    total_stickers = v_total,
    pasted_count = v_pasted,
    duplicate_count = COALESCE(v_duplicates, 0),
    completion_percent = v_completion,
    updated_at = NOW()
  WHERE id = v_user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_profile_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_stickers
  FOR EACH ROW EXECUTE FUNCTION update_profile_stats();

-- ============================================================
-- PONTOS DE TROCA OFICIAIS (seed data)
-- ============================================================
INSERT INTO trade_points (name, description, address, city, state, country, latitude, longitude, type, is_active, schedule) VALUES
  ('Panini Store São Paulo', 'Loja oficial Panini com área de troca', 'Av. Paulista, 1000', 'São Paulo', 'SP', 'Brasil', -23.5648, -46.6517, 'oficial', true, 'Seg-Sex 10h-20h, Sáb 10h-18h'),
  ('Panini Store Rio de Janeiro', 'Loja oficial Panini no Rio', 'Rua do Passeio, 48', 'Rio de Janeiro', 'RJ', 'Brasil', -22.9068, -43.1729, 'oficial', true, 'Seg-Sex 10h-20h, Sáb 10h-18h'),
  ('Panini Store Belo Horizonte', 'Loja oficial Panini em BH', 'Av. do Contorno, 5000', 'Belo Horizonte', 'MG', 'Brasil', -19.9167, -43.9345, 'oficial', true, 'Seg-Sex 10h-20h, Sáb 10h-18h'),
  ('Panini Store Brasília', 'Loja oficial Panini na capital', 'SCS Quadra 6, Bloco A', 'Brasília', 'DF', 'Brasil', -15.7801, -47.9292, 'oficial', true, 'Seg-Sex 10h-20h, Sáb 10h-18h'),
  ('Panini Store Curitiba', 'Loja oficial Panini em Curitiba', 'Rua das Flores, 100', 'Curitiba', 'PR', 'Brasil', -25.4289, -49.2671, 'oficial', true, 'Seg-Sex 10h-20h, Sáb 10h-18h'),
  ('Panini Store Porto Alegre', 'Loja oficial Panini em POA', 'Rua dos Andradas, 200', 'Porto Alegre', 'RS', 'Brasil', -30.0346, -51.2177, 'oficial', true, 'Seg-Sex 10h-20h, Sáb 10h-18h'),
  ('Panini Store Recife', 'Loja oficial Panini no Recife', 'Av. Boa Viagem, 500', 'Recife', 'PE', 'Brasil', -8.1270, -34.9011, 'oficial', true, 'Seg-Sex 10h-20h, Sáb 10h-18h'),
  ('Panini Store Salvador', 'Loja oficial Panini em Salvador', 'Av. Tancredo Neves, 1000', 'Salvador', 'BA', 'Brasil', -12.9711, -38.5108, 'oficial', true, 'Seg-Sex 10h-20h, Sáb 10h-18h'),
  ('Panini Store Fortaleza', 'Loja oficial Panini em Fortaleza', 'Av. Bezerra de Menezes, 300', 'Fortaleza', 'CE', 'Brasil', -3.7316, -38.5267, 'oficial', true, 'Seg-Sex 10h-20h, Sáb 10h-18h'),
  ('Panini Store Manaus', 'Loja oficial Panini em Manaus', 'Av. Eduardo Ribeiro, 500', 'Manaus', 'AM', 'Brasil', -3.1190, -60.0217, 'oficial', true, 'Seg-Sex 10h-20h, Sáb 10h-18h');
