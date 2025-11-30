# Testando a Aplicação Localmente

Agora que o banco Neon está verificado e as variáveis de ambiente foram configuradas no Vercel, você pode testar tudo localmente.

## 1️⃣ Testar Banco de Dados Localmente

```powershell
node test-db-connection.js
```

Deve retornar: "✅ Conexão bem-sucedida!"

---

## 2️⃣ Testar Endpoints Serverless Localmente

### Opção A: Usar Vercel Dev (Recomendado)

```powershell
vercel dev
```

Isso irá:
- Rodar o frontend em http://localhost:3000
- Servir os endpoints serverless em `/api/*`
- Usar as variáveis de `.env.local`

**Testar no navegador:**
1. Abra http://localhost:3000
2. Vá em **Cadastrar**
3. Preencha um formulário (nome, CPF, telefone, email, senha)
4. Clique em **Criar Conta**

**Esperado:**
- ✅ Mensagem "Conta criada! Faça login."
- ✅ Usuário aparece em `test-db-connection.js` (total aumenta)

### Opção B: Testar um Endpoint com curl (Manual)

```powershell
# Test POST /api/auth/register
$body = @{
    nome = "João Silva"
    email = "joao@example.com"
    senha = "senha123"
    cpf = "123.456.789-00"
    telefone = "(81) 99999-9999"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

---

## 3️⃣ Testar Build Vite

```powershell
npm run build
```

Deve gerar pasta `dist/` com os arquivos compilados.

**Verificar:**
```powershell
Get-ChildItem dist/ | Select-Object Name
```

Deve conter: `index.html`, `index-*.js`, `style-*.css`, etc.

---

## 4️⃣ Deploy em Produção

Após testar localmente, faça deploy:

```powershell
vercel --prod
```

**Verificar:**
1. Acesse a URL do Vercel (ex: https://recife-sustentavel-app-main-...vercel.app)
2. Tente cadastrar novamente
3. Verifique logs: `vercel logs <deployment-id>`

---

## 📋 Endpoints Disponíveis

| Método | Rota | O Que Faz |
|--------|------|----------|
| POST | `/api/auth/register` | Criar nova conta (com JWT automático) |
| POST | `/api/auth/login` | Login com email + senha |
| GET | `/api/me` | Obter perfil do usuário (requer Bearer token) |
| POST | `/api/descarte` | Registrar descarte (requer Bearer token) |

---

## 🔐 Tokens JWT

Após fazer login ou cadastro, o token é guardado em:
```javascript
localStorage.getItem('recife_sustentavel_session')
// Retorna: { token: "eyJhbGc...", user: { id, nome, email, ... } }
```

Para usar em requisições:
```javascript
fetch('/api/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## ❓ Problemas Comuns

### Erro: "Banco de dados não configurado"
- Verifique `.env.local`: `DATABASE_URL=postgresql://...`
- Se estiver usando `vercel dev`, rode `vercel env pull` para sincronizar variáveis.

### Erro: "Email já cadastrado"
- Normal! Use um email diferente a cada teste.
- Para limpar: abra Neon console e rode `DELETE FROM usuarios;`

### Erro: "Cors error"
- Se em produção, verifique que `src/api/auth/register.ts` tem headers CORS.
- Se em localhost, deveria funcionar sem problemas.

---

## 🚀 Próximos Passos

1. **Confirme que o cadastro/login funcionam localmente**
2. **Configure as variáveis no Vercel Dashboard** (veja `ENV_SETUP_VERCEL.md`)
3. **Faça `vercel --prod`**
4. **Teste os endpoints em produção**
