/**
 * Script para testar endpoints de autenticação
 * Use durante vercel dev
 * Execute: node test-endpoints.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
let authToken = null;
let userId = null;

async function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  console.log('🧪 Testando Endpoints de Autenticação\n');

  try {
    // Test 1: Register
    console.log('1️⃣  POST /api/auth/register');
    const registerPayload = {
      nome: `Teste ${Date.now()}`,
      email: `teste${Date.now()}@example.com`,
      senha: 'senha123',
      cpf: '123.456.789-00',
      telefone: '(81) 99999-9999',
    };

    const registerRes = await request('POST', '/api/auth/register', registerPayload);
    console.log(`   Status: ${registerRes.status}`);
    
    if (registerRes.status === 201) {
      console.log(`   ✅ Cadastro bem-sucedido!`);
      console.log(`   Usuário: ${registerRes.data.usuario.nome}`);
      console.log(`   Email: ${registerRes.data.usuario.email}`);
      console.log(`   Saldo inicial: ${registerRes.data.usuario.saldo_pontos}`);
      authToken = registerRes.data.token;
      userId = registerRes.data.usuario.id;
    } else {
      console.log(`   ❌ Erro: ${registerRes.data.error}`);
    }

    console.log('\n---\n');

    // Test 2: Login
    if (!authToken) {
      console.log('2️⃣  POST /api/auth/login');
      const loginPayload = {
        email: registerPayload.email,
        senha: registerPayload.senha,
      };

      const loginRes = await request('POST', '/api/auth/login', loginPayload);
      console.log(`   Status: ${loginRes.status}`);

      if (loginRes.status === 200 && loginRes.data.token) {
        console.log(`   ✅ Login bem-sucedido!`);
        console.log(`   Token: ${loginRes.data.token.substring(0, 20)}...`);
        authToken = loginRes.data.token;
        userId = loginRes.data.usuario.id;
      } else {
        console.log(`   ❌ Erro: ${loginRes.data.error}`);
      }
    }

    console.log('\n---\n');

    // Test 3: Get Profile
    if (authToken) {
      console.log('3️⃣  GET /api/me (com Bearer token)');
      const profileRes = await request('GET', '/api/me', null, {
        'Authorization': `Bearer ${authToken}`,
      });
      console.log(`   Status: ${profileRes.status}`);

      if (profileRes.status === 200) {
        console.log(`   ✅ Perfil obtido!`);
        const user = profileRes.data.user || profileRes.data;
        console.log(`   Nome: ${user.nome}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Saldo: ${user.saldo_pontos}`);
      } else {
        console.log(`   ❌ Erro: ${profileRes.data.error}`);
      }
    }

    console.log('\n✨ Testes completos!\n');

  } catch (error) {
    console.error('❌ Erro ao testar:', error.message);
  }
}

// Wait for vercel dev to start
setTimeout(test, 1000);
