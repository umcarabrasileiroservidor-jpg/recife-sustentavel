/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

// Lê as variáveis do arquivo .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Trava de segurança: Se o arquivo .env não for lido, avisa no console
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('ERRO CRÍTICO: Faltam as variáveis VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY no arquivo .env.local');
}

// Cria a conexão
export const supabase = createClient(supabaseUrl, supabaseAnonKey);