import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { list } from '@vercel/blob';

async function testarTudo() {
  console.log('\n🔍 --- INICIANDO DIAGNÓSTICO DE CHAVES --- 🔍\n');

  // 1. TESTE JWT
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length > 10) {
    console.log('✅ JWT_SECRET: Definido e parece seguro.');
    console.log('   Valor:', process.env.JWT_SECRET.substring(0, 20) + '...');
  } else {
    console.error('❌ JWT_SECRET: Ausente ou muito curto!');
  }

  // 2. TESTE BANCO DE DADOS (NEON)
  console.log('\n⏳ Testando conexão com NEON DB...');
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: true });
    const res = await pool.query('SELECT NOW()');
    console.log('✅ NEON DB: Conectado! Hora do servidor:', res.rows[0].now);
    
    // Testa se tabelas existem
    const tablesRes = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    const tables = tablesRes.rows.map(r => r.table_name);
    console.log('   Tabelas encontradas:', tables.join(', '));
    await pool.end();
  } catch (err) {
    console.error('❌ NEON DB: Falha na conexão!', err.message);
  }

  // 3. TESTE GOOGLE GEMINI IA
  console.log('\n⏳ Testando conexão com GOOGLE GEMINI...');
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Diga apenas 'OK'");
    const response = await result.response;
    console.log('✅ GOOGLE IA: Respondeu ->', response.text().trim());
  } catch (err) {
    console.error('❌ GOOGLE IA: Falha!', err.message);
  }

  // 4. TESTE VERCEL BLOB (FOTOS)
  console.log('\n⏳ Testando conexão com VERCEL BLOB...');
  try {
    // Tenta listar arquivos (operação de leitura leve)
    const blobs = await list({ token: process.env.BLOB_READ_WRITE_TOKEN });
    console.log('✅ VERCEL BLOB: Token válido e acesso confirmado.');
    console.log('   Arquivos no storage:', blobs.blobs.length);
  } catch (err) {
    console.error('❌ VERCEL BLOB: Falha!', err.message);
  }

  // 5. TESTE DATABASE_URL formato
  console.log('\n⏳ Validando formato de DATABASE_URL...');
  if (process.env.DATABASE_URL) {
    if (process.env.DATABASE_URL.startsWith('postgresql://')) {
      console.log('✅ DATABASE_URL: Formato correto (PostgreSQL)');
    } else {
      console.error('❌ DATABASE_URL: Formato inválido! Deve começar com postgresql://');
    }
  } else {
    console.error('❌ DATABASE_URL: Não definida!');
  }

  console.log('\n🏁 --- FIM DO DIAGNÓSTICO --- 🏁\n');
}

testarTudo().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
