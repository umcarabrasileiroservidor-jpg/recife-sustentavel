# 📖 Resumo Rápido para Prova - Recife Sustentável

## 1️⃣ FLUXO DE REGISTRO (Sign Up)

```
USUÁRIO digita:
  nome: "João Silva"
  email: "joao@email.com"
  senha: "senha123"

↓

BACKEND (/api/auth/register) faz:
  1. Hash senha: "senha123" → "$2a$10$....."
  2. INSERT usuarios table
  3. Gera JWT token
  4. Retorna token + dados

↓

FRONTEND salva no localStorage:
  {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    usuario: { id, nome, email, saldo_pontos: 50 }
  }
```

## 2️⃣ FLUXO DE LOGIN

```
USUÁRIO digita:
  email: "joao@email.com"
  senha: "senha123"

↓

BACKEND (/api/auth/login) faz:
  1. Busca usuário: SELECT * FROM usuarios WHERE email = $1
  2. Se não encontra: erro 401 ❌
  3. Compara senha: bcryptjs.compare("senha123", "$2a$10$...")
  4. Se não bate: erro 401 ❌
  5. Se tudo OK: gera token JWT
  6. Retorna token + dados ✅

↓

FRONTEND salva token e redireciona para home
```

## 3️⃣ FLUXO DE DESCARTE (Coleta de Lixo)

```
USUÁRIO faz scan via câmera

↓

FRONTEND envia POST /api/descarte:
  {
    tipo_residuo: "Plastico",
    multiplicador: 1,
    pontos_base: 10,
    foto: base64
  }
  Header: Authorization: Bearer <token>

↓

BACKEND (/api/descarte) faz TRANSAÇÃO:
  BEGIN TRANSACTION
    1. INSERT INTO descartes
    2. UPDATE usuarios SET saldo_pontos += 10
    3. INSERT INTO transacoes (log)
  COMMIT

  Se OK: retorna { success, points: 10 } ✅
  Se erro no meio: ROLLBACK (desfaz tudo) ❌

↓

FRONTEND soma 10 pontos ao saldo do usuário
```

## 4️⃣ O QUE É JWT?

**JWT = Token de Autenticação sem sessão**

```
TRADICIONAL (com sessão):
  Cliente → Login → Servidor cria SESSION
  Cliente guarda SESSION_ID
  Próximas requisições: enviam SESSION_ID
  Servidor procura na memória por SESSION_ID
  ❌ Não funciona bem em Serverless (sem memória compartilhada)

MODERNO (JWT):
  Cliente → Login → Servidor gera TOKEN JWT assinado
  Cliente guarda TOKEN
  Próximas requisições: enviam TOKEN no header
  Servidor valida assinatura (sem memória)
  ✅ Funciona bem em Serverless
```

**Estrutura JWT:**
```
Header.Payload.Signature

Header:    { alg: "HS256", typ: "JWT" }
Payload:   { userId: "123", email: "joao@email.com", exp: 1703236260 }
Signature: HMACSHA256(Header + Payload + SECRET)
```

## 5️⃣ COMO SENHAS SÃO PROTEGIDAS?

```
❌ ERRADO:
  senha digitada: "senha123"
  salva no banco: "senha123" ← PODE SER ROUBADA!

✅ CORRETO (com bcrypt):
  senha digitada: "senha123"
  hash gerado:    "$2a$10$JV8I7H5dZ.fG9e7K3m2L1OmN5p4O3qRs2T1UvWxYz..."
  
  ✓ Impossível reverter o hash para obter a senha original
  ✓ Mesmo que roubem o banco, não conseguem a senha
  ✓ Cada execução gera hash DIFERENTE (mesmo com mesma senha)
```

## 6️⃣ STATUS CODES HTTP

```
200 OK                - Tudo certo!
201 Created           - Novo recurso criado (POST /register)
400 Bad Request       - Dados inválidos (faltando campo)
401 Unauthorized      - Token inválido/expirado ou senha errada
403 Forbidden         - Logado mas sem permissão
404 Not Found         - URL não existe
409 Conflict          - Email já cadastrado
500 Internal Error    - Erro no servidor
```

## 7️⃣ TRANSAÇÕES SQL

**O que é?** Garante que um CONJUNTO de operações tudo-ou-nada.

```
BEGIN TRANSACTION
  INSERT INTO descartes...
  UPDATE usuarios SET saldo...
  INSERT INTO transacoes...
COMMIT

❌ Se erro no meio:
  ROLLBACK (desfaz tudo como se nunca tivesse acontecido)

✅ Se OK:
  COMMIT (salva tudo permanentemente)
```

## 8️⃣ MIDDLEWARES & PROTEÇÃO

```typescript
// MIDDLEWARE: extrair e validar token
function autenticar(req) {
  const authHeader = req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;  // Não autenticado
  }
  const token = authHeader.slice(7);
  const payload = verificarToken(token);
  if (!payload) {
    return null;  // Token inválido/expirado
  }
  return payload;  // { userId, email, iat, exp }
}

// USO EM UM ENDPOINT:
export default async function handler(req, res) {
  const payload = autenticar(req);
  if (!payload) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  // Agora temos payload.userId = ID do usuário logado
}
```

## 9️⃣ TABELAS DO BANCO

```
USUARIOS
├─ id (UUID) ← chave primária
├─ nome
├─ email (UNIQUE)
├─ senha_hash
├─ cpf
├─ telefone
├─ saldo_pontos (inteiro, começando 50)
├─ nivel_usuario ("Iniciante")
└─ criado_em, atualizado_em

DESCARTES
├─ id (UUID) ← chave primária
├─ usuario_id ← foreign key para usuarios
├─ tipo_residuo ("Plastico", "Metal", etc)
├─ multiplicador_volume (1.0, 1.5, 2.0)
├─ pontos_ganhos
├─ validado_ia
└─ criado_em

TRANSACOES
├─ id (UUID) ← chave primária
├─ usuario_id ← foreign key para usuarios
├─ tipo ("ganho", "resgate", "penalidade")
├─ descricao
├─ valor
└─ criado_em

RECOMPENSAS
├─ id (UUID) ← chave primária
├─ titulo
├─ descricao
├─ custo_pontos
├─ parceiro
├─ ativo
└─ ativo_em
```

## 🔟 FLUXO COMPLETO (Tela de Login)

```
1. Usuário preenche formulário
   nome: "João", email: "joao@email.com", senha: "123456"

2. Frontend valida (ex: email tem @?)

3. Frontend POST /api/auth/register com JSON

4. Backend recebe
   - Valida (todos campos preenchidos?)
   - Hash senha: "123456" → "$2a$10$..."
   - INSERT usuarios
   - Gera token JWT: "eyJhbGciOi..."
   - Retorna token + usuario

5. Frontend recebe resposta
   - Salva no localStorage
   - Redireciona para /home

6. Próxima ação (ex: fazer descarte)
   - Frontend lê token do localStorage
   - POST /api/descarte com:
     Authorization: Bearer eyJhbGciOi...
   - Backend valida token
   - Backend executa operação

7. Se token expirar após 7 dias
   - Frontend recebe erro 401
   - Redireciona para /login
   - Usuário faz login novamente
```

## ⚠️ SEGURANÇA - NUNCA FAZER

```
❌ Guardar senha em texto plano
❌ Comitar .env.local no GitHub
❌ JWT_SECRET no código (deve ser variável de ambiente)
❌ SQL com concatenação ("SELECT * FROM usuarios WHERE id = " + id)
❌ Retornar "Email não encontrado" (revela quais emails existem)
❌ Retornar erro genérico "Erro no servidor" (deve ser específico em debug)
❌ Guardar dados sensíveis no JWT (ele é só base64, qualquer pessoa lê!)
```

## ✅ SEGURANÇA - SEMPRE FAZER

```
✅ Hash de senha com bcrypt (10+ rounds)
✅ JWT_SECRET em .env.local
✅ Validação de entrada (req.body)
✅ SQL com placeholders ($1, $2, $3...)
✅ Erros genéricos em produção ("Email ou senha inválidos")
✅ Transações para operações críticas
✅ Verificar token em toda requisição autenticada
✅ Logs de erro (console.error) para debugging
```

## 📝 PARA A PROVA - PREPARAÇÃO

**Conceitos que vão cair:**
1. ✅ JWT: o que é, como funciona, estrutura
2. ✅ Hash de senha: bcrypt, rounds, comparação
3. ✅ Fluxo de auth: registro vs login vs logout
4. ✅ Transações SQL: BEGIN, COMMIT, ROLLBACK
5. ✅ HTTP Status Codes: 200, 201, 400, 401, 409, 500
6. ✅ Middlewares: autenticar, validar
7. ✅ Bancos de dados: tabelas, foreign keys, constraints
8. ✅ Segurança: o que fazer/não fazer
9. ✅ Arquitetura: frontend → API → banco

**Dicas:**
- Entender POR QUE cada coisa (não só memorizar)
- Praticar implementar novo endpoint
- Entender fluxo de dados de ponta a ponta
- Conhecer os erros mais comuns

---

**Boa sorte na prova! 🚀**
