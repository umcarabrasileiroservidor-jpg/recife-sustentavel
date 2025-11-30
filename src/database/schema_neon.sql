-- Schema para Vercel Neon (nomes em português)
-- Use centavos inteiros para valores monetários (evita floats)

-- Extensões úteis

-- Habilita extensão para IDs únicos e criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL UNIQUE,
  senha_hash text NOT NULL, -- Obrigatório para o login próprio
  cpf text,
  telefone text,
  saldo_pontos integer DEFAULT 0, -- Mudado de centavos para pontos
  nivel_usuario text DEFAULT 'Iniciante',
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- 2. Tabela de Pontos de Coleta (Lixeiras)
CREATE TABLE IF NOT EXISTS pontos_coleta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_local text NOT NULL, -- Ex: Praça do Derby
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  tipos_aceitos text[], -- Array de textos: ['Plástico', 'Vidro']
  status text DEFAULT 'ativa', -- ativa, cheia, manutencao
  criado_em timestamptz DEFAULT now()
);

-- 3. Tabela de Descartes (O Histórico do Scanner) - ESSA ESTAVA FALTANDO
CREATE TABLE IF NOT EXISTS descartes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  ponto_coleta_id uuid REFERENCES pontos_coleta(id) ON DELETE SET NULL, -- Opcional
  tipo_residuo text NOT NULL,
  multiplicador_volume decimal(3,2) DEFAULT 1.0, -- Vem da IA (1.0, 1.5, 2.0)
  pontos_ganhos integer NOT NULL,
  url_foto text, -- Link do Vercel Blob
  validado_ia boolean DEFAULT false,
  criado_em timestamptz DEFAULT now()
);

-- 4. Tabela de Transações (Extrato)
CREATE TABLE IF NOT EXISTS transacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('ganho', 'resgate', 'penalidade')),
  descricao text,
  valor integer NOT NULL, -- Positivo ou Negativo
  criado_em timestamptz DEFAULT now()
);

-- 5. Tabela de Recompensas (Loja)
CREATE TABLE IF NOT EXISTS recompensas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  custo_pontos integer NOT NULL,
  parceiro text, -- Ex: Cinema, iFood
  imagem_url text,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now()
);

-- 6. Tabela de Metas Semanais (Gamificação)
CREATE TABLE IF NOT EXISTS metas_semanais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  semana_inicio date NOT NULL, -- A data da segunda-feira
  dias_concluidos integer DEFAULT 0,
  ultimo_descarte date, -- Para travar as 24h
  meta_atingida boolean DEFAULT false,
  criado_em timestamptz DEFAULT now(),
  UNIQUE(usuario_id, semana_inicio) -- Evita duplicidade na mesma semana
);

-- 7. Função para atualizar 'atualizado_em'
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

-- SEED (Dados Iniciais para não começar vazio)
INSERT INTO pontos_coleta (nome_local, latitude, longitude, tipos_aceitos) VALUES
('Praça do Derby', -8.0522, -34.8956, ARRAY['Plástico', 'Papel']),
('Shopping Recife', -8.1194, -34.9050, ARRAY['Eletrônico', 'Pilhas']),
('Parque da Jaqueira', -8.0389, -34.8989, ARRAY['Orgânico', 'Metal']);

INSERT INTO recompensas (titulo, descricao, custo_pontos, parceiro) VALUES
('Vale Cinema', 'Ingresso grátis', 500, 'Cinépolis'),
('Desconto VEM', 'Crédito de R$ 10', 300, 'Grande Recife');

