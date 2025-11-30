/**
 * src/lib/db.ts
 * Cliente de conexão para Neon/Postgres com reutilização global em ambientes serverless
 * Implementação baseada em `pg.Pool` para máxima compatibilidade.
 */

import { Pool } from 'pg';

// Obter connection string (suporta NEON_DATABASE_URL como alternativa)
const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || process.env.NEON_POSTGRESQL_CONNECTION_STRING;
if (!connectionString) {
  throw new Error('Database connection string not provided. Set NEON_DATABASE_URL or DATABASE_URL.');
}

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  var __pgPool: Pool | undefined;
}

const pool: Pool = globalThis.__pgPool ?? new Pool({
  connectionString,
  ssl: true, // SSL obrigatório para Neon
});

if (!globalThis.__pgPool) globalThis.__pgPool = pool;

console.log('✅ Pool de conexão criado com sucesso (reutilizável em serverless)');

export default pool;
