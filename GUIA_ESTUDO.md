# 📚 Guia de Estudo - Sistema Recife Sustentável

## Índice
1. [Arquitetura Geral](#arquitetura-geral)
2. [Fluxo de Autenticação JWT](#fluxo-de-autenticação-jwt)
3. [Fluxo de Registro](#fluxo-de-registro)
4. [Fluxo de Login](#fluxo-de-login)
5. [Fluxo de Descarte](#fluxo-de-descarte)
6. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
7. [Conceitos-Chave](#conceitos-chave)

---

## Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                      NAVEGADOR (Frontend)                    │
│  React Component → DataService → fetch() → HTTP Request     │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP POST/GET
                         │ Com JWT Token no Header
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (Backend/API)                      │
│  /api/auth/register.ts                                       │
│  /api/auth/login.ts                                          │
│  /api/descarte.ts                                            │
│  /api/usuarios/[id].ts                                       │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL Query
                         ↓
┌─────────────────────────────────────────────────────────────┐
│               VERCEL NEON (PostgreSQL Database)              │
│  Tabelas: usuarios, descartes, transacoes, recompensas      │
└─────────────────────────────────────────────────────────────┘
```

### O que é uma API REST?
- **API** = Interface que permite comunicação entre programas
- **REST** = Padrão usando HTTP (GET, POST, PUT, DELETE)
- **Endpoint** = URL específica que faz uma ação (ex: `/api/auth/login`)

---

## Fluxo de Autenticação JWT

### O que é JWT?

JWT = **JSON Web Token** (um padrão para segurança em APIs)

**Sem JWT:**
```
Cliente           Servidor
  │                 │
  ├──login()──────→ │ (servidor salva sessão em memória)
  │←─session_id─────┤
  │                 │
  ├──request()─────→ │ (enviar session_id)
  │←─resposta───────┤
```
❌ Problema: Servidor precisa guardar sessões = não escalável em Serverless

**Com JWT:**
```
Cliente           Servidor
  │                 │
  ├──login()──────→ │
  │←─token─────────┤ (token criado e enviado)
  │                 │
  ├──request()─────→ │ (enviar token)
  │ Header: Authorization: Bearer <token>
  │←─resposta───────┤
```
✅ Vantagem: Servidor não precisa guardar nada = escalável!

### Estrutura de um JWT

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VySWQiOiIxMjMtdXVpZCIsImVtYWlsIjoiam9hb0BlbWFpbC5jb20iLCJpYXQiOjE2MDI2MzE0NjAsImV4cCI6MTYwMzIzNjI2MH0.
TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ
```

Um JWT tem 3 partes separadas por pontos:

1. **Header** (Cabeçalho)
   ```json
   {
     "alg": "HS256",  // Algoritmo de assinatura
     "typ": "JWT"     // Tipo de token
   }
   ```

2. **Payload** (Dados)
   ```json
   {
     "userId": "123-uuid",
     "email": "joao@email.com",
     "iat": 1602631460,     // Issued At (criado em)
     "exp": 1603236260      // Expiration (expira em)
   }
   ```

3. **Signature** (Assinatura)
   - Criada combinando: Header + Payload + JWT_SECRET
   - Garante que o token não foi adulterado
   - Se alguém mudar os dados, a assinatura não bate

### Como o JWT Protege?

```
SERVIDOR guarda: JWT_SECRET = "minha_chave_super_secreta"

CLIENTE recebe: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Quando cliente faz nova requisição:
  Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

SERVIDOR:
  1. Extrai o token do header
  2. Decodifica o payload
  3. Recalcula a assinatura usando JWT_SECRET
  4. Compara: assinatura recebida == assinatura calculada?
  5. Se bater: token é válido ✅
  6. Se não bater: token foi adulterado ❌
```

---

## Fluxo de Registro

### Diagrama

```
┌──────────────┐
│   Frontend   │
│ (Login.tsx)  │
└──────┬───────┘
       │ POST /api/auth/register
       │ Body: { nome, email, senha, cpf, telefone }
       ↓
┌──────────────────────────┐
│   Backend (register.ts)  │
│ 1. Validar dados         │
│ 2. Hash senha com bcrypt │
│ 3. INSERT na tabela      │
│ 4. Gerar JWT token       │
│ 5. Retornar token+user   │
└──────┬───────────────────┘
       │
       ↓
┌──────────────────────────┐
│  Banco (usuarios table)  │
│ Novo usuário criado      │
└──────────────────────────┘
```

### Código Passo a Passo

```typescript
// 1. CLIENTE ENVIA
fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'João Silva',
    email: 'joao@email.com',
    senha: 'senha123',
    cpf: '123.456.789-00',
    telefone: '81999999999'
  })
})

// 2. BACKEND RECEBE E VALIDA
const { nome, email, senha, cpf, telefone } = req.body;
if (!nome || !email || !senha) {
  return res.status(400).json({ error: 'Dados obrigatórios faltando' });
}

// 3. CRIPTOGRAFAR SENHA
// NUNCA guardar senha em texto plano!
const senhaHash = await bcryptjs.hash(senha, 10);
// senha: "senha123"
// hash:  "$2a$10$JV8I7H5dZ.fG9e7K3m2L1OmN5p4O3qRs2T1UvWxYz..."

// 4. INSERIR NO BANCO (PostgreSQL)
const result = await pool.query(
  `INSERT INTO usuarios (nome, email, senha_hash, cpf, telefone, saldo_pontos)
   VALUES ($1, $2, $3, $4, $5, 50)
   RETURNING *`,
  [nome, email, senhaHash, cpf, telefone]
);

// 5. GERAR JWT
const token = jwt.sign(
  { userId: usuario.id, email: usuario.email },
  JWT_SECRET,
  { expiresIn: '7d' }
);

// 6. RETORNAR RESPOSTA
return res.status(201).json({
  success: true,
  token,
  usuario: { id, nome, email, saldo_pontos: 50 }
});

// 7. FRONTEND RECEBE E SALVA
const data = await response.json();
localStorage.setItem('recife_sustentavel_session', JSON.stringify({
  token: data.token,
  user: data.usuario
}));
```

### Por que Hash de Senha?

```
❌ ERRADO (NUNCA FAZER):
senha guardada no banco: "senha123"
→ Se alguém roubar o banco, tem TODAS as senhas!

✅ CORRETO:
senha original: "senha123"
senha no banco: "$2a$10$JV8I7H5dZ.fG9e7K3m2L1OmN5p4O3qRs2T1UvWxYz..."
→ Mesmo se roubarem o banco, não conseguem descobrir a senha!

PROCESSO:
1. Usuário digita "senha123" no login
2. Sistema faz: bcryptjs.compare("senha123", "$2a$10...")
3. Se bater: login OK ✅
4. Se não bater: senha incorreta ❌
```

---

## Fluxo de Login

```
┌──────────────┐
│   Frontend   │
│ (Login.tsx)  │
└──────┬───────┘
       │ POST /api/auth/login
       │ Body: { email, senha }
       ↓
┌──────────────────────────┐
│   Backend (login.ts)     │
│ 1. Buscar usuário        │
│ 2. Validar senha         │
│ 3. Gerar JWT token       │
│ 4. Retornar token+user   │
└──────┬───────────────────┘
       │
       ↓
┌──────────────────────────┐
│  Frontend salva token    │
│  localStorage            │
│  Redireciona para home   │
└──────────────────────────┘
```

### Validação de Senha

```typescript
// CLIENTE ENVIA
{ email: "joao@email.com", senha: "senha123" }

// BACKEND EXECUTA
const usuario = await pool.query(
  'SELECT * FROM usuarios WHERE email = $1',
  [email]
);

const senhaCorreta = await bcryptjs.compare(
  "senha123",                    // o que o usuário digitou
  "$2a$10$JV8I7H5dZ..."         // hash guardado no banco
);

if (!senhaCorreta) {
  return res.status(401).json({ error: 'Email ou senha inválidos' });
}

// Se chegou aqui: senha está correta!
const token = gerarToken(usuario.id, usuario.email);
return res.status(200).json({ token, usuario });
```

---

## Fluxo de Descarte

### O que é um Descarte?

Um descarte = quando o usuário faz scan de lixo reciclável
- Tipo: Plástico, Metal, Papel, etc.
- Pontos ganhos: multiplicador × pontos_base

### Fluxo Transacional

```
┌──────────────┐
│   Frontend   │
│  (Scanner)   │
└──────┬───────┘
       │ POST /api/descarte
       │ Header: Authorization: Bearer <token>
       │ Body: { tipo_residuo, multiplicador, pontos_base }
       ↓
┌────────────────────────────────────────────────┐
│   Backend (descarte.ts) - TRANSACIONAL         │
│                                                │
│ BEGIN TRANSACTION                              │
│   1. INSERT INTO descartes                    │
│   2. UPDATE usuarios.saldo_pontos += pontos   │
│   3. INSERT INTO transacoes (log)             │
│ COMMIT TRANSACTION                             │
│                                                │
│ Se tudo OK: commit ✅                          │
│ Se erro no meio: rollback (desfaz tudo) ❌   │
└────────────────────────────────────────────────┘
```

### Por que Transação?

```
❌ SEM TRANSAÇÃO (problema):
1. INSERT descarte ✅
2. UPDATE saldo → ERRO! ❌
→ Resultado: descarte registrado mas saldo não atualizou!

✅ COM TRANSAÇÃO:
BEGIN
  1. INSERT descarte
  2. UPDATE saldo → ERRO!
ROLLBACK (desfaz tudo)
→ Resultado: tudo volta ao estado anterior (nenhum registro!)
```

### Código

```typescript
const { tipo_residuo, multiplicador, pontos_base } = req.body;

// AUTENTICAR: extrair token do header
const payload = autenticar(req);
if (!payload) {
  return res.status(401).json({ error: 'Não autorizado' });
}

// CALCULAR PONTOS
const pontos_ganhos = pontos_base * (multiplicador || 1);

const client = await pool.connect();

try {
  await client.query('BEGIN');
  
  // 1. REGISTRAR DESCARTE
  const descarteResult = await client.query(
    `INSERT INTO descartes (usuario_id, tipo_residuo, multiplicador_volume, pontos_ganhos)
     VALUES ($1, $2, $3, $4)
     RETURNING id, pontos_ganhos`,
    [payload.userId, tipo_residuo, multiplicador, pontos_ganhos]
  );
  
  // 2. ATUALIZAR SALDO DO USUÁRIO
  await client.query(
    `UPDATE usuarios SET saldo_pontos = saldo_pontos + $1 WHERE id = $2`,
    [pontos_ganhos, payload.userId]
  );
  
  // 3. REGISTRAR NA TABELA DE TRANSAÇÕES (log)
  await client.query(
    `INSERT INTO transacoes (usuario_id, tipo, descricao, valor)
     VALUES ($1, $2, $3, $4)`,
    [payload.userId, 'ganho', `Descarte de ${tipo_residuo}`, pontos_ganhos]
  );
  
  await client.query('COMMIT');
  
  return res.status(200).json({
    success: true,
    descarte_id: descarteResult.rows[0].id,
    points: pontos_ganhos
  });
  
} catch (error) {
  await client.query('ROLLBACK');
  return res.status(500).json({ error: 'Erro ao processar descarte' });
} finally {
  client.release();
}
```

---

## Estrutura do Banco de Dados

### Tabela: usuarios

```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  cpf VARCHAR(14),
  telefone VARCHAR(20),
  saldo_pontos INTEGER DEFAULT 0,
  nivel_usuario VARCHAR(50) DEFAULT 'Iniciante',
  criado_em TIMESTAMP DEFAULT now(),
  atualizado_em TIMESTAMP DEFAULT now()
);
```

**Explicação:**
- `id UUID`: Identificador único (melhor que números inteiros)
- `email UNIQUE`: Não pode ter dois usuários com mesmo email
- `senha_hash VARCHAR(255)`: String criptografada
- `saldo_pontos INTEGER`: Quantos "Capivaras" o usuário tem
- `criado_em TIMESTAMP`: Data de criação automática
- `atualizado_em TIMESTAMP`: Data de atualização (atualiza com trigger)

### Tabela: descartes

```sql
CREATE TABLE descartes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  tipo_residuo VARCHAR(50) NOT NULL,
  multiplicador_volume NUMERIC(4,2) DEFAULT 1.0,
  pontos_ganhos INTEGER NOT NULL,
  validado_ia BOOLEAN DEFAULT false,
  criado_em TIMESTAMP DEFAULT now()
);
```

**Explicação:**
- `usuario_id`: Foreign key (referencia qual usuário fez o descarte)
- `tipo_residuo`: "Plastico", "Metal", "Papel", etc.
- `multiplicador_volume`: 1.0, 1.5, 2.0 (quanto maior, mais pontos)
- `validado_ia`: Se a IA validou a foto (true/false)

### Tabela: transacoes

```sql
CREATE TABLE transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ganho', 'resgate', 'penalidade')),
  descricao TEXT,
  valor INTEGER NOT NULL,
  criado_em TIMESTAMP DEFAULT now()
);
```

**Explicação:**
- `tipo CHECK`: Só aceita 'ganho', 'resgate' ou 'penalidade'
- `valor`: Quantos pontos foram adicionados/subtraídos
- Log completo de cada transação (auditoria)

---

## Conceitos-Chave

### 1. HTTP Status Codes

```
200 OK              - Requisição bem-sucedida
201 Created         - Novo recurso criado (POST /register)
400 Bad Request     - Dados inválidos (faltando campo obrigatório)
401 Unauthorized    - Token inválido ou expirado
403 Forbidden       - Autenticado mas sem permissão
404 Not Found       - Recurso não existe
409 Conflict        - Email já cadastrado
500 Internal Error  - Erro no servidor
```

### 2. Métodos HTTP

```
GET     - Ler dados (ex: GET /usuarios/123)
POST    - Criar dados (ex: POST /auth/register)
PUT     - Atualizar dados completos
DELETE  - Deletar dados
PATCH   - Atualizar parte dos dados
```

### 3. Headers HTTP Importantes

```
Content-Type: application/json
→ Avisa ao servidor que estamos enviando JSON

Authorization: Bearer <token>
→ Token JWT para autenticação

Access-Control-Allow-Origin: *
→ CORS: permite requisições de outros domínios
```

### 4. Placeholders SQL ($1, $2, $3...)

```typescript
// ❌ INSEGURO (SQL Injection):
const query = `INSERT INTO usuarios (email) VALUES ('${email}')`;
// Se email = "'; DROP TABLE usuarios; --"
// Query vira: INSERT INTO usuarios (email) VALUES (''; DROP TABLE usuarios; --')
// Deleta toda a tabela! 😱

// ✅ SEGURO:
const query = `INSERT INTO usuarios (email) VALUES ($1)`;
const result = await pool.query(query, [email]);
// $1 é substituído pelo valor em [email] de forma segura
```

### 5. Env Variables (.env.local)

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=chave_super_secreta_256_caracteres_random
BLOB_READ_WRITE_TOKEN=token_para_upload_arquivos
```

- Nunca comitar `.env.local` no GitHub
- Cada ambiente tem seus valores diferentes
- Acessar em código: `process.env.DATABASE_URL`

---

## Resumo da Segurança

✅ **O que fazemos certo:**
1. Senhas criptografadas com bcrypt
2. JWT para autenticação stateless
3. SQL injection protection com placeholders
4. CORS headers configurados
5. Transações atômicas para consistência
6. Env variables para dados sensíveis

❌ **Nunca fazer:**
1. Guardar senha em texto plano
2. Enviar senha no JWT
3. JWT_SECRET no GitHub
4. SQL strings com concatenação
5. Confiar em token do cliente (sempre verificar no servidor)

---

## Para a Prova

**Conceitos que vão cair:**
1. O que é JWT e por que usar
2. Fluxo de registro vs login
3. Como hash protege senhas
4. Diferença entre stateful (sessão) vs stateless (JWT)
5. O que é transação SQL e por que é importante
6. HTTP status codes e métodos
7. Como CORS funciona
8. Estrutura do banco de dados (tabelas, foreign keys)
9. Planejadores SQL vs concatenação
10. Middlewares de autenticação

**Dica de estudo:**
- Entender o fluxo de dados (cliente → API → banco)
- Saber por que cada decisão foi feita (não só memorizar código)
- Praticar escrevendo endpoints novos
- Entender erros comuns (por que falha)

---

**Boa sorte na prova! 🚀**
