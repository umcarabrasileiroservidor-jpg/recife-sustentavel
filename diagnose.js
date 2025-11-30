/**
 * Script para verificar se a aplicação pode rodar localmente
 * Simula o que o Vercel faz: load da app e tenta renderizar
 */

console.log('🧪 Teste de Renderização React\n');

// Test 1: Verificar se dist/index.html existe
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'dist', 'index.html');
const assetsPath = path.join(__dirname, 'dist', 'assets');

console.log('1️⃣  Verificando arquivos build...');
console.log(`   index.html: ${fs.existsSync(indexPath) ? '✅ OK' : '❌ MISSING'}`);
console.log(`   assets/: ${fs.existsSync(assetsPath) ? '✅ OK' : '❌ MISSING'}`);

if (fs.existsSync(assetsPath)) {
  const assets = fs.readdirSync(assetsPath);
  console.log(`   Arquivos em assets/: ${assets.length}`);
  assets.forEach(file => {
    const size = fs.statSync(path.join(assetsPath, file)).size;
    const sizeMB = (size / 1024 / 1024).toFixed(2);
    console.log(`     - ${file} (${sizeMB}MB)`);
  });
}

console.log('\n2️⃣  Verificando import de módulos críticos...');

try {
  const packageJson = require('./package.json');
  console.log(`   React: ${packageJson.dependencies.react || 'not found'} ✅`);
  console.log(`   React-DOM: ${packageJson.dependencies['react-dom'] || 'not found'} ✅`);
  console.log(`   Vite: ${packageJson.devDependencies.vite || 'not found'} ✅`);
} catch (e) {
  console.log(`   ❌ Erro ao ler package.json: ${e.message}`);
}

console.log('\n3️⃣  Verificando env vars (.env.local)...');

try {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf-8');
    const hasDatabase = env.includes('DATABASE_URL');
    const hasJwt = env.includes('JWT_SECRET');
    
    console.log(`   DATABASE_URL: ${hasDatabase ? '✅ configurada' : '❌ faltando'}`);
    console.log(`   JWT_SECRET: ${hasJwt ? '✅ configurada' : '❌ faltando'}`);
  } else {
    console.log(`   ⚠️  .env.local não existe (normal em produção)`);
  }
} catch (e) {
  console.log(`   ⚠️  Erro ao ler .env.local: ${e.message}`);
}

console.log('\n4️⃣  Recomendações...\n');

console.log('   Para testar localmente:');
console.log('   $ vercel dev');
console.log('   $ Abra http://localhost:3000 no navegador');
console.log('   $ Pressione F12 e vá em Console para ver erros\n');

console.log('   Se vir erros vermelhos no console, copie e procure em:');
console.log('   → TROUBLESHOOTING.md\n');

console.log('   Se funciona localmente mas não em produção:');
console.log('   $ Ir em Vercel Dashboard → Settings → Environment Variables');
console.log('   $ Adicionar: DATABASE_URL, JWT_SECRET, etc');
console.log('   $ Fazer: vercel --prod\n');

console.log('✨ Teste concluído!');
