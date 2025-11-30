import { Pool } from '@neondatabase/serverless';

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || process.env.NEON_POSTGRESQL_CONNECTION_STRING;
if (!connectionString) {
  throw new Error('Database connection string not provided. Set NEON_DATABASE_URL or DATABASE_URL.');
}

const pool = new Pool({
  connectionString,
  ssl: true,
});

export default pool;
