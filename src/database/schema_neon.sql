-- ============================================
-- 1. EXTENSÕES
-- ============================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- 2. TABELA DE USUÁRIOS
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL UNIQUE,
  senha_hash text NOT NULL,
  cpf text,
  telefone text,
  saldo_pontos integer DEFAULT 0,
  nivel_usuario text DEFAULT 'Iniciante',
  status_conta text DEFAULT 'ativo',
  is_admin boolean DEFAULT false,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- TRIGGER de atualização
CREATE OR REPLACE FUNCTION atualiza_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualiza_usuarios
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE PROCEDURE atualiza_timestamp();

-- ============================================
-- 3. PONTOS DE COLETA
-- ============================================
CREATE TABLE IF NOT EXISTS pontos_coleta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_local text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  tipos_aceitos text[],
  status text DEFAULT 'ativa',
  capacidade_total integer DEFAULT 100,
  criado_em timestamptz DEFAULT now()
);

-- ============================================
-- 4. TABELA DE DESCARTES (SCANNER)
-- ============================================
CREATE TABLE IF NOT EXISTS descartes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  ponto_coleta_id uuid REFERENCES pontos_coleta(id) ON DELETE SET NULL,
  tipo_residuo text NOT NULL,
  multiplicador_volume decimal(3,2) DEFAULT 1.0,
  pontos_ganhos integer,
  pontos_estimados integer DEFAULT 0,
  status text DEFAULT 'pendente',
  url_foto text,
  validado_ia boolean DEFAULT false,
  data_analise timestamptz,
  criado_em timestamptz DEFAULT now()
);

-- ============================================
-- 5. TABELA DE TRANSAÇÕES (EXTRATO)
-- ============================================
CREATE TABLE IF NOT EXISTS transacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('ganho', 'resgate', 'penalidade')),
  descricao text,
  valor integer NOT NULL,
  criado_em timestamptz DEFAULT now()
);

-- ============================================
-- 6. TABELA DE RECOMPENSAS
-- ============================================
CREATE TABLE IF NOT EXISTS recompensas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  custo_pontos integer NOT NULL,
  parceiro text,
  imagem_url text,
  ativo boolean DEFAULT true,
  tipo text DEFAULT 'voucher',
  validade date,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

CREATE TRIGGER trigger_atualiza_recompensas
BEFORE UPDATE ON recompensas
FOR EACH ROW EXECUTE PROCEDURE atualiza_timestamp();

-- ============================================
-- 7. METAS SEMANAIS
-- ============================================
CREATE TABLE IF NOT EXISTS metas_semanais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  semana_inicio date NOT NULL,
  dias_concluidos integer DEFAULT 0,
  ultimo_descarte date,
  meta_atingida boolean DEFAULT false,
  criado_em timestamptz DEFAULT now(),
  UNIQUE(usuario_id, semana_inicio)
);

-- ============================================
-- 8. PENALIDADES
-- ============================================
CREATE TABLE IF NOT EXISTS penalidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  motivo text,
  duracao_dias integer DEFAULT 0,
  status text DEFAULT 'ativa',
  data_aplicacao timestamptz DEFAULT now(),
  data_expiracao timestamptz
);

-- ============================================
-- 9. DADOS INICIAIS
-- ============================================

-- Pontos de coleta
INSERT INTO pontos_coleta (nome_local, latitude, longitude, tipos_aceitos) VALUES
('Praça do Derby', -8.0522, -34.8956, ARRAY['Plástico','Papel','Metal','Vidro']),
('Shopping Recife', -8.1194, -34.9050, ARRAY['Eletrônico','Pilhas','Baterias']),
('Parque da Jaqueira', -8.0389, -34.8989, ARRAY['Orgânico','Plástico','Metal']),
('Boa Viagem (Posto 7)', -8.1277, -34.8948, ARRAY['Plástico','Metal','Vidro']),
('Casa Forte', -8.0265, -34.9264, ARRAY['Orgânico','Seco']);

-- Recompensas
INSERT INTO recompensas (titulo, descricao, custo_pontos, parceiro) VALUES
('Vale Cinema', 'Ingresso grátis em salas 2D', 500, 'Cinépolis'),
('Desconto VEM', 'Crédito de R$ 10 no cartão VEM', 300, 'Grande Recife'),
('Vale Shopping', 'R$ 50 off em lojas parceiras', 500, 'Shopping Recife'),
('Desconto iFood', 'R$ 20 off em pedidos acima de R$ 40', 200, 'iFood');

-- Torna você Admin (opcional)
UPDATE usuarios SET is_admin = true WHERE email = 'kerllonv4@gmail.com';
