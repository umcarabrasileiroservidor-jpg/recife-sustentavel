# 🧪 Guia de Testes da API

## 1️⃣ Iniciar o Servidor (Front + Back)

Com a Vercel CLI instalada, rode:

```bash
vercel dev
```

O servidor iniciará em **http://localhost:3000**

Se pedir para "Link to existing project?", responda **Yes** e selecione o projeto.

---

## 2️⃣ Testar Endpoints com cURL

### 📝 **SIGNUP (Cadastro)**

```bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "senha": "senha123",
    "cpf": "123.456.789-00",
    "telefone": "81999999999"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nome": "João Silva",
    "email": "joao@example.com",
    "cpf": "123.456.789-00",
    "telefone": "81999999999",
    "saldo_pontos": 50,
    "nivel_usuario": "Iniciante"
  }
}
```

---

### 🔑 **LOGIN**

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "senha": "senha123"
  }'
```

**Resposta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "email": "joao@example.com",
    "balance": 50,
    "cpf": "123.456.789-00",
    "telefone": "81999999999",
    "nivel_usuario": "Iniciante",
    "last_disposal_time": null
  }
}
```

---

### ♻️ **REGISTRAR DESCARTE (com token)**

```bash
curl -X POST http://localhost:3000/api/descarte \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "tipo_residuo": "Plastico",
    "multiplicador": 1,
    "pontos_base": 10
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "descarte_id": "660e8400-e29b-41d4-a716-446655440111",
  "points": 10
}
```

---

### 🎁 **RESGATAR RECOMPENSA (com token)**

```bash
curl -X POST http://localhost:3000/api/recompensa \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "cost": 100,
    "title": "Brinde Parceiro"
  }'
```

---

### 👤 **OBTER PERFIL (com token)**

```bash
curl -X GET http://localhost:3000/api/usuarios/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

### 🏆 **LISTAR RECOMPENSAS (público, sem token)**

```bash
curl -X GET http://localhost:3000/api/recompensas/list
```

**Resposta esperada:**
```json
{
  "recompensas": [
    {
      "id": "...",
      "titulo": "Vale Café",
      "descricao": "Vale de café no parceiro",
      "custo_pontos": 100,
      "parceiro": "Café Sustentável",
      "ativo": true
    }
  ]
}
```

---

## 3️⃣ Usando o Frontend

1. Vá para **http://localhost:3000**
2. Clique em **"Não tem conta? Registre-se"**
3. Preencha os dados (nome, email, senha)
4. Clique em **"Criar conta"**
5. Faça login com as credenciais criadas
6. Explore o dashboard

---

## ⚠️ Troubleshooting

### Erro: "Cannot find module"
- Certifique-se de que instalou: `npm install pg jsonwebtoken bcryptjs`

### Erro: "JWT_SECRET not defined"
- Verifique que `.env.local` contém: `JWT_SECRET=sua_chave_secreta_aqui`

### Erro: "Database connection failed"
- Verifique que `.env.local` contém: `DATABASE_URL=postgresql://usuario:senha@host:5432/dbname`

---

## 📝 Arquivo de Ambiente (.env.local)

```env
DATABASE_URL=postgresql://user:password@ep-mute-fog-123456.us-east-1.postgres.vercel.com:5432/recife_sustentavel
JWT_SECRET=sua_chave_secreta_super_segura_aqui
BLOB_READ_WRITE_TOKEN=token_blob_aqui
```

---

**Pronto para testar! 🚀**
