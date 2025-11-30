# ✅ Backend API - Pronto para Testes

## 📋 Resumo das Alterações

### 🔧 Arquivos Criados/Atualizados

#### 1. **CORS Configurado em Todos os Endpoints**
   - ✅ `src/api/auth/register.ts` - Atualizado com headers CORS
   - ✅ `src/api/auth/login.ts` - Atualizado com headers CORS
   - ✅ `src/api/signup.ts` - Novo (alternativa a register)
   - ✅ `src/api/login.ts` - Novo (endpoint simples de login)

#### 2. **Banco de Dados em Português**
   - ✅ Todos endpoints usam tabela `usuarios` (não `users`)
   - ✅ Coluna `senha_hash` para armazenar senha criptografada
   - ✅ Coluna `saldo_pontos` (integer, começando com 50 pontos)
   - ✅ Coluna `nivel_usuario` ("Iniciante" por padrão)

#### 3. **Autenticação JWT**
   - ✅ `src/lib/auth.ts` - Funções de JWT e bcrypt
   - ✅ Token válido por 7 dias
   - ✅ Resposta com token + usuário

#### 4. **Endpoints de Negócio**
   - ✅ `/api/descarte` - Registrar coleta de resíduos (transaction)
   - ✅ `/api/recompensa` - Resgatar recompensas (atomicidade)
   - ✅ `/api/usuarios/[id]` - Perfil do usuário (GET/PUT)
   - ✅ `/api/recompensas/list` - Listar recompensas (público)

---

## 🚀 Como Testar Agora

### **Passo 1: Iniciar o Servidor**

```bash
cd "c:\Users\kerll\Downloads\RecifeSustentavel-App-main\RecifeSustentavel-App-main"
vercel dev
```

Aguarde até aparecer:
```
> Ready! Available at http://localhost:3000
```

### **Passo 2: Testar Signup**

Abra PowerShell e execute:

```powershell
$body = @{
    nome = "Teste Silva"
    email = "teste@example.com"
    senha = "senha123"
    cpf = "123.456.789-00"
    telefone = "81999999999"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/signup" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body | Select-Object -ExpandProperty Content
```

### **Passo 3: Testar Login**

```powershell
$body = @{
    email = "teste@example.com"
    senha = "senha123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body | Select-Object -ExpandProperty Content
```

### **Passo 4: Testar Descarte (com Token)**

```powershell
# Use o token retornado no login
$token = "seu_token_aqui_do_passo_anterior"

$body = @{
    tipo_residuo = "Plastico"
    multiplicador = 1
    pontos_base = 10
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/descarte" `
  -Method POST `
  -Headers @{
    "Content-Type"="application/json"
    "Authorization"="Bearer $token"
  } `
  -Body $body | Select-Object -ExpandProperty Content
```

---

## 📊 Estrutura de Respostas

### Signup ✅
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "nome": "Nome Usuário",
    "email": "email@example.com",
    "cpf": "123.456.789-00",
    "telefone": "81999999999",
    "saldo_pontos": 50,
    "nivel_usuario": "Iniciante"
  }
}
```

### Login ✅
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Nome Usuário",
    "email": "email@example.com",
    "balance": 50,
    "cpf": "123.456.789-00",
    "telefone": "81999999999",
    "nivel_usuario": "Iniciante",
    "last_disposal_time": null
  }
}
```

### Descarte ✅
```json
{
  "success": true,
  "descarte_id": "uuid",
  "points": 10
}
```

---

## ✔️ Pré-Requisitos Antes de Testar

- [x] `.env.local` com `JWT_SECRET` configurado
- [x] `.env.local` com `DATABASE_URL` (Neon)
- [x] SQL schema executado em Neon (tabela `usuarios` criada)
- [x] `npm install pg jsonwebtoken bcryptjs` já feito
- [x] Vercel CLI instalada (`npm install -g vercel`)

---

## 🎯 Próximos Passos

1. ✅ Testar endpoints com comandos acima
2. ✅ Acessar http://localhost:3000 no navegador
3. ✅ Registrar novo usuário via UI
4. ✅ Fazer login e verificar dashboard
5. ✅ Testar scanner (descarte)
6. ✅ Testar resgate de recompensas

---

**Tudo pronto! 🚀 Comece a testar agora!**
