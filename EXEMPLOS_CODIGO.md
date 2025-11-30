# 💻 Exemplos de Código - Explicados Linha por Linha

## 1. CRIAR UM USUÁRIO (REGISTRO)

### O que o usuário vê:
```
Nome: João Silva
Email: joao@email.com
Senha: senha123
CPF: 123.456.789-00
Telefone: 81999999999

[Botão: Criar Conta]
```

### O que o Frontend faz:
```javascript
// Arquivo: src/components/Login.tsx

async function handleRegister() {
  // Pega os valores do formulário
  const nome = document.getElementById('nome').value;  // "João Silva"
  const email = document.getElementById('email').value;  // "joao@email.com"
  const senha = document.getElementById('senha').value;  // "senha123"
  
  // Valida antes de enviar
  if (!nome || !email || !senha) {
    alert('Preencha todos os campos');
    return;
  }
  
  // Faz a requisição POST para o backend
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'  // Estamos enviando JSON
    },
    body: JSON.stringify({
      nome,
      email,
      senha,
      cpf: '123.456.789-00',
      telefone: '81999999999'
    })
  });
  
  // Recebe a resposta
  const data = await response.json();
  
  if (!response.ok) {
    alert('Erro: ' + data.error);  // Mostra erro do servidor
    return;
  }
  
  // Sucesso! Salva o token
  localStorage.setItem('recife_sustentavel_session', JSON.stringify({
    token: data.token,
    usuario: data.usuario
  }));
  
  // Redireciona para home
  window.location.href = '/home';
}
```

### O que o Backend faz:
```typescript
// Arquivo: src/api/auth/register.ts

export default async function handler(req, res) {
  // req.method = 'POST'
  // req.body = { nome: 'João Silva', email: 'joao@email.com', ... }
  
  // PASSO 1: Validar
  const { nome, email, senha, cpf, telefone } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Dados obrigatórios faltando' });
    // Status 400 = Bad Request (dados do cliente estão errados)
  }
  
  // PASSO 2: Criptografar senha
  const senhaHash = await hashSenha(senha);
  // senhaHash = "$2a$10$JV8I7H5dZ.fG9e7K3m2L1OmN5p4O3qRs2T1UvWxYz..."
  // Cada execução gera um hash DIFERENTE, mesmo com a mesma senha!
  
  // PASSO 3: Inserir no banco
  const result = await pool.query(
    `INSERT INTO usuarios (nome, email, senha_hash, cpf, telefone, saldo_pontos, nivel_usuario)
     VALUES ($1, $2, $3, $4, $5, 50, 'Iniciante')
     RETURNING *`,
    [nome, email, senhaHash, cpf, telefone]
    // $1 = nome, $2 = email, $3 = senhaHash, $4 = cpf, $5 = telefone
    // Isso previne SQL injection!
  );
  
  const usuario = result.rows[0];
  // usuario = { id: 'uuid-...', nome: 'João Silva', email: '...', saldo_pontos: 50, ... }
  
  // PASSO 4: Gerar token JWT
  const token = gerarToken(usuario.id, usuario.email);
  // token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ..."
  
  // PASSO 5: Retornar
  return res.status(201).json({
    success: true,
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      saldo_pontos: 50  // Recém-criado, sempre começa com 50
    }
  });
  // Status 201 = Created (novo recurso foi criado com sucesso)
}
```

### No banco de dados:
```sql
-- Antes do INSERT:
SELECT COUNT(*) FROM usuarios;
-- Resultado: 0 usuários

-- INSERT executado pelo backend
INSERT INTO usuarios (nome, email, senha_hash, cpf, telefone, saldo_pontos, nivel_usuario)
VALUES ('João Silva', 'joao@email.com', '$2a$10$...', '123.456.789-00', '81999999999', 50, 'Iniciante')
RETURNING *;

-- Depois:
SELECT COUNT(*) FROM usuarios;
-- Resultado: 1 usuário
SELECT * FROM usuarios;
-- Resultado:
-- id: 550e8400-e29b-41d4-a716-446655440000
-- nome: João Silva
-- email: joao@email.com
-- senha_hash: $2a$10$... (não podemos recuperar a senha!)
-- saldo_pontos: 50
-- nivel_usuario: Iniciante
```

---

## 2. FAZER LOGIN

### Frontend:
```javascript
async function handleLogin() {
  const email = 'joao@email.com';
  const senha = 'senha123';
  
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    alert('Erro: ' + data.error);
    return;
  }
  
  // Salva o token
  localStorage.setItem('recife_sustentavel_session', JSON.stringify({
    token: data.token,
    usuario: data.usuario
  }));
  
  // Redireciona
  window.location.href = '/home';
}
```

### Backend:
```typescript
export default async function handler(req, res) {
  const { email, senha } = req.body;
  
  // PASSO 1: Buscar usuário
  const result = await pool.query(
    `SELECT * FROM usuarios WHERE email = $1`,
    [email]
  );
  
  // PASSO 2: Verificar se foi encontrado
  if (result.rows.length === 0) {
    // ⚠️ Não dizemos "Email não encontrado"
    // Por segurança, mensagem genérica
    return res.status(401).json({ error: 'Email ou senha inválidos' });
    // Status 401 = Unauthorized
  }
  
  const usuario = result.rows[0];
  
  // PASSO 3: Comparar senha
  const senhaValida = await compararSenha(senha, usuario.senha_hash);
  // senha = "senha123" (texto plano)
  // usuario.senha_hash = "$2a$10$..." (hash do banco)
  // compararSenha faz: bcryptjs.compare("senha123", "$2a$10$...")
  
  if (!senhaValida) {
    return res.status(401).json({ error: 'Email ou senha inválidos' });
  }
  
  // PASSO 4: Gerar novo token
  const token = gerarToken(usuario.id, usuario.email);
  
  // PASSO 5: Retornar
  return res.status(200).json({
    success: true,
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      saldo_pontos: usuario.saldo_pontos
    }
  });
  // Status 200 = OK (login bem-sucedido)
}
```

### O que acontece:
```
1. Usuário entra email: joao@email.com
2. Backend: SELECT * FROM usuarios WHERE email = 'joao@email.com'
   → Encontra: { id: 'uuid-...', email: 'joao@email.com', senha_hash: '$2a$10$...', ... }

3. Usuário entra senha: senha123
4. Backend: bcryptjs.compare('senha123', '$2a$10$...')
   → Retorna: true (significa que é a mesma senha!)

5. Backend gera token JWT com userId e email
6. Retorna token e dados do usuário
7. Frontend salva token e redireciona
```

---

## 3. FAZER UM DESCARTE (Coletar Lixo)

### Frontend:
```javascript
async function registrarDescarte() {
  // Pega o token do localStorage
  const session = JSON.parse(localStorage.getItem('recife_sustentavel_session'));
  const token = session.token;
  
  // Dados do descarte
  const tipo_residuo = 'Plastico';
  const multiplicador = 1.5;
  const pontos_base = 10;
  
  // Faz a requisição
  const response = await fetch('/api/descarte', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`  // Envia o token no header
    },
    body: JSON.stringify({
      tipo_residuo,
      multiplicador,
      pontos_base
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    alert('Erro: ' + data.error);
    return;
  }
  
  // Sucesso! Atualiza saldo local
  session.usuario.saldo_pontos += data.points;  // +15 pontos (10 * 1.5)
  localStorage.setItem('recife_sustentavel_session', JSON.stringify(session));
  
  alert('Descarte registrado! +' + data.points + ' pontos');
}
```

### Backend:
```typescript
export default async function handler(req, res) {
  // PASSO 1: Autenticar (validar token)
  const payload = autenticar(req);
  if (!payload) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
  // payload = { userId: 'uuid-...', email: 'joao@email.com' }
  
  // Agora sabemos quem é o usuário!
  const userId = payload.userId;
  
  // PASSO 2: Extrair dados
  const { tipo_residuo, multiplicador, pontos_base } = req.body;
  const pontos_ganhos = pontos_base * (multiplicador || 1);
  // pontos_ganhos = 10 * 1.5 = 15
  
  // PASSO 3: TRANSAÇÃO (tudo ou nada)
  const client = await pool.connect();
  
  try {
    // Iniciar transação
    await client.query('BEGIN');
    
    // 3a. Registrar o descarte
    const descarteResult = await client.query(
      `INSERT INTO descartes (usuario_id, tipo_residuo, multiplicador_volume, pontos_ganhos)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [userId, tipo_residuo, multiplicador, pontos_ganhos]
    );
    
    // 3b. Atualizar o saldo do usuário
    await client.query(
      `UPDATE usuarios SET saldo_pontos = saldo_pontos + $1 WHERE id = $2`,
      [pontos_ganhos, userId]
    );
    
    // 3c. Registrar na tabela de transações (log)
    await client.query(
      `INSERT INTO transacoes (usuario_id, tipo, descricao, valor)
       VALUES ($1, $2, $3, $4)`,
      [userId, 'ganho', `Descarte de ${tipo_residuo}`, pontos_ganhos]
    );
    
    // Se chegou aqui, tudo funcionou!
    await client.query('COMMIT');
    
    return res.status(200).json({
      success: true,
      descarte_id: descarteResult.rows[0].id,
      points: pontos_ganhos
    });
    
  } catch (error) {
    // Se houve erro, desfaz TUDO
    await client.query('ROLLBACK');
    return res.status(500).json({ error: 'Erro ao processar descarte' });
    
  } finally {
    // Libera a conexão
    client.release();
  }
}
```

### No banco:
```sql
-- ANTES:
SELECT saldo_pontos FROM usuarios WHERE id = 'uuid-...';
-- Resultado: 50

-- Backend executa BEGIN TRANSACTION:
INSERT INTO descartes (...) VALUES (...)
UPDATE usuarios SET saldo_pontos = saldo_pontos + 15 WHERE id = 'uuid-...'
INSERT INTO transacoes (...) VALUES (...)
COMMIT;

-- DEPOIS:
SELECT saldo_pontos FROM usuarios WHERE id = 'uuid-...';
-- Resultado: 65 (50 + 15)

SELECT * FROM descartes WHERE usuario_id = 'uuid-...';
-- Resultado: { id: 'uuid-...', usuario_id: 'uuid-...', tipo_residuo: 'Plastico', ... }

SELECT * FROM transacoes WHERE usuario_id = 'uuid-...' ORDER BY criado_em DESC LIMIT 1;
-- Resultado: { id: 'uuid-...', tipo: 'ganho', valor: 15, ... }
```

---

## 4. JWT - ENTENDER A ESTRUTURA

### Criar um token:
```typescript
const token = jwt.sign(
  { userId: '123-uuid', email: 'joao@email.com' },  // dados
  'minha_chave_secreta',                             // chave
  { expiresIn: '7d' }                                // opções
);

// token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMtdXVpZCIsImVtYWlsIjoiam9hb0BlbWFpbC5jb20iLCJpYXQiOjE3MDI2MzE0NjAsImV4cCI6MTcwMzIzNjI2MH0.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ"
```

### Partes do token:
```
1. Header:
   Base64.decode("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9")
   = { "alg": "HS256", "typ": "JWT" }

2. Payload:
   Base64.decode("eyJ1c2VySWQiOiIxMjMtdXVpZCIsImVtYWlsIjoiam9hb0BlbWFpbC5jb20iLCJpYXQiOjE3MDI2MzE0NjAsImV4cCI6MTcwMzIzNjI2MH0")
   = { "userId": "123-uuid", "email": "joao@email.com", "iat": 1702631460, "exp": 1703236260 }

3. Signature:
   HMACSHA256(Header + "." + Payload + secretKey)
   = "TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ"
```

### Validar token:
```typescript
const payload = jwt.verify(token, 'minha_chave_secreta');
// Se a chave for diferente: ERROR (token foi adulterado!)
// Se expirado: ERROR
// Se OK: retorna { userId: '123-uuid', email: 'joao@email.com', iat: 1702631460, exp: 1703236260 }
```

---

## 5. BCRYPT - HASH DE SENHA

### Gerar hash:
```typescript
const senha = 'senha123';

const hash = await bcryptjs.hash(senha, 10);
// hash1 = "$2a$10$JV8I7H5dZ.fG9e7K3m2L1OmN5p4O3qRs2T1UvWxYz..."
// hash2 = "$2a$10$NaO7K2mK1DZ.gH9e8K3m1PmO6q5P4rSt3U2VwXyZa..."
// São DIFERENTES! Mesmo sendo da mesma senha!

// Partes do hash:
// $2a$  = tipo de hash (bcrypt)
// 10$   = rounds (10 = força)
// JV8I7H5dZ.fG9e7K3m2L1O = salt (aleatório)
// mN5p4O3qRs2T1UvWxYz... = hash real
```

### Comparar hash:
```typescript
const senha = 'senha123';
const hashDoBanco = "$2a$10$JV8I7H5dZ.fG9e7K3m2L1OmN5p4O3qRs2T1UvWxYz...";

const resultado = await bcryptjs.compare(senha, hashDoBanco);
// bcryptjs faz:
// 1. Extrai o salt do hash: "JV8I7H5dZ.fG9e7K3m2L1O"
// 2. Faz hash da senha com esse salt
// 3. Compara o novo hash com o antigo
// 4. Se forem iguais: true
// 5. Se diferentes: false

if (resultado === true) {
  console.log('Senha correta!');
} else {
  console.log('Senha errada!');
}
```

---

## 6. SQL INJECTION - O QUE NUNCA FAZER

### ❌ INSEGURO:
```typescript
const email = req.body.email;  // "joao@email.com'; DROP TABLE usuarios; --"

// Concatenação direta
const query = `SELECT * FROM usuarios WHERE email = '${email}'`;
// query = "SELECT * FROM usuarios WHERE email = 'joao@email.com'; DROP TABLE usuarios; --'"
// SQL executa: 
//   1. SELECT * FROM usuarios WHERE email = 'joao@email.com'
//   2. DROP TABLE usuarios  ← DELETA TODA A TABELA! 😱

await pool.query(query);  // DESASTRE!
```

### ✅ SEGURO:
```typescript
const email = req.body.email;

// Usar placeholders
const query = `SELECT * FROM usuarios WHERE email = $1`;
// $1 = placeholder (não é executado como código SQL)

await pool.query(query, [email]);
// O email é substituído de forma segura
// "joao@email.com'; DROP TABLE usuarios; --" é tratado como um STRING normal
// Não é executado como comando SQL!
```

---

**Esses exemplos cobrem os fluxos principais! Estude-os e entenda cada linha! 🎓**
