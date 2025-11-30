/**
 * Script para testar conexão com Neon e verificar schema do banco
 * Execute: node test-db-connection.js
 */

const { Pool } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_w8DkbicQheT1@ep-fancy-truth-adz2tllk-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function testConnection() {
  try {
    console.log('🔄 Conectando ao Neon...');
    
    // Test 1: Simple connection
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conexão bem-sucedida!');
    console.log('   Horário do servidor:', result.rows[0].now);

    // Test 2: List all tables
    console.log('\n📋 Tabelas no banco:');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    if (tables.rows.length === 0) {
      console.log('   ⚠️  Nenhuma tabela encontrada! O schema pode não ter sido criado.');
    } else {
      tables.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }

    // Test 3: Check usuarios table structure
    console.log('\n🔍 Estrutura da tabela "usuarios":');
    const usuariosSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'usuarios'
      ORDER BY ordinal_position;
    `);

    if (usuariosSchema.rows.length === 0) {
      console.log('   ⚠️  Tabela "usuarios" não existe!');
    } else {
      usuariosSchema.rows.forEach(row => {
        const nullable = row.is_nullable === 'YES' ? 'nullable' : 'NOT NULL';
        console.log(`   - ${row.column_name}: ${row.data_type} (${nullable})`);
      });
    }

    // Test 4: Count users
    console.log('\n👥 Usuários no banco:');
    const countUsers = await pool.query('SELECT COUNT(*) as total FROM usuarios');
    console.log(`   Total: ${countUsers.rows[0].total}`);

    // Test 5: List users (limit 5)
    const users = await pool.query('SELECT id, nome, email, saldo_pontos FROM usuarios LIMIT 5');
    if (users.rows.length === 0) {
      console.log('   (nenhum usuário)');
    } else {
      users.rows.forEach(user => {
        console.log(`   - ${user.nome} (${user.email}) - Saldo: ${user.saldo_pontos}`);
      });
    }

    console.log('\n✨ Teste completo!');
    
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

testConnection();
