import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';

// FORÇA a leitura do arquivo .env.local
try {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
} catch (e) {
  console.log("Aviso: Não foi possível carregar .env.local (normal em produção)");
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ ERRO FATAL: DATABASE_URL não encontrada!");
}

const pool = new Pool({ 
  connectionString,
  ssl: true 
});

export default pool;