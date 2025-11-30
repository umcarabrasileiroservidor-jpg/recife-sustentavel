# 🚀 Checklist Completo — Deploy Recife Sustentável no Vercel

## Status: ✅ Pronto para Deploy

Este checklist resume tudo o que foi feito e o que você precisa fazer para ter a aplicação funcionando em produção.

---

## ✅ O Que Já Foi Feito

### Backend
- ✅ Criado endpoint `/api/auth/register` (com JWT automático e CORS)
- ✅ Criado endpoint `/api/auth/login` (com JWT)
- ✅ Criado endpoint `/api/me` (lê JWT Bearer token)
- ✅ Criado endpoint `/api/descarte` (transacional: upload blob + atualizar BD)
- ✅ Implementado `src/lib/db.ts` (Pool PostgreSQL com reutilização global)
- ✅ Implementado `src/lib/auth.ts` (JWT + bcrypt)
- ✅ Melhorado tratamento de erros (JSON sempre, nunca HTML)
- ✅ Vite configurado para gerar `dist` (o que Vercel espera)
- ✅ `vercel.json` configurado corretamente

### Frontend
- ✅ Removidos imports com sufixo de versão (e.g., `sonner@2.0.3` → `sonner`)
- ✅ TypeScript sem erros (`npx tsc --noEmit` ✅)
- ✅ `Login.tsx` chamando `/api/auth/register` e `/api/auth/login` corretamente
- ✅ `dataService.ts` com fallback para respostas não-JSON
- ✅ Build Vite gerando `dist/` com sucesso

### Banco de Dados
- ✅ Conexão Neon verificada e funcional
- ✅ Schema completo: `usuarios`, `descartes`, `transacoes`, `recompensas`, etc.
- ✅ `.env.local` com `DATABASE_URL` configurado

---

## 📋 Próximas Ações (Obrigatórias)

### 1. Configurar Variáveis de Ambiente no Vercel
**🔗 Link:** https://vercel.com/kerllons-projects-ae21a1bb/recife-sustentavel-app-main

Ir em **Settings → Environment Variables** e adicionar:

| Variável | Valor | Exemplo |
|----------|-------|---------|
| `DATABASE_URL` | URL Neon completa | `postgresql://neondb_owner:npg_...` |
| `JWT_SECRET` | String secreta | `segredo-super-secreto-do-projeto-recife-2025` |
| `BLOB_READ_WRITE_TOKEN` | Token Vercel Blob (opcional) | `vercel_blob_rw_zk1f...` |
| `GOOGLE_API_KEY` | Google Gemini key (opcional) | `AlzaSyAO2s...` |

**⚠️ IMPORTANTE:** Para cada variável, marque **Production** (checkbox verde).

**Documento de ajuda:** Ver `ENV_SETUP_VERCEL.md`

### 2. Testar Localmente (Recomendado)

```powershell
# Terminal 1: Iniciar Vercel Dev
vercel dev

# Terminal 2: Testar endpoints
node test-endpoints.js
```

**Esperado:**
- Frontend carrega em http://localhost:3000
- Endpoints `/api/auth/register` e `/api/auth/login` funcionam
- Usuários podem se cadastrar e fazer login

Ou teste manualmente:
1. Abra http://localhost:3000 no navegador
2. Clique em **Cadastrar**
3. Preencha o formulário
4. Clique em **Criar Conta**
5. Deve aparecer: "Conta criada! Faça login."

### 3. Fazer Deploy em Produção

```powershell
# Opção A: Via CLI (recomendado)
vercel --prod

# Opção B: Push git e deixar Vercel fazer deploy automático
git add -A
git commit -m "Deploy: Vercel Neon + JWT auth"
git push origin main
```

**Esperado:** URL será como https://recife-sustentavel-app-main-...vercel.app

### 4. Verificar Logs em Produção

```powershell
vercel logs recife-sustentavel-app-main
```

**Se houver erro 500:**
- Verifique que `DATABASE_URL` foi configurada corretamente
- Verifique `JWT_SECRET` foi configurada
- Redeploy: `vercel --prod`

---

## 🧪 Scripts de Teste Disponíveis

| Script | Comando | O Que Faz |
|--------|---------|----------|
| Testar BD | `node test-db-connection.js` | Conecta ao Neon e verifica schema |
| Testar API | `node test-endpoints.js` | Testa `/api/auth/register`, `/api/login`, `/api/me` |
| Build Vite | `npm run build` | Gera pasta `dist/` |
| Build+Vercel | `npm run build && vercel dev` | Testa build + endpoints localmente |
| TypeScript | `npx tsc --noEmit` | Verifica erros de tipo |

---

## 📚 Documentação de Referência

- **`ENV_SETUP_VERCEL.md`** — Como configurar variáveis no Vercel
- **`TESTING_GUIDE.md`** — Como testar a aplicação
- **`src/lib/auth.ts`** — Lógica de JWT + bcrypt
- **`src/lib/db.ts`** — Conexão com Neon
- **`src/api/auth/register.ts`** — Endpoint de cadastro (comentado em detalhes)
- **`src/api/auth/login.ts`** — Endpoint de login
- **`src/api/me.ts`** — Endpoint de perfil
- **`src/api/descarte.ts`** — Endpoint transacional

---

## 🎯 Fluxo de Usuário (O que Acontece)

### 1. Cadastro
```
Usuário preenche formulário
↓
POST /api/auth/register { nome, email, senha, cpf, telefone }
↓
Backend: bcrypt.hash(senha)
↓
Backend: INSERT INTO usuarios
↓
Backend: gera JWT token com gerarToken()
↓
Frontend recebe: { token, usuario }
↓
Frontend salva em localStorage
↓
Frontend faz login automático
```

### 2. Login
```
Usuário preenche email + senha
↓
POST /api/auth/login { email, senha }
↓
Backend: SELECT senha_hash FROM usuarios WHERE email
↓
Backend: bcrypt.compare(senha, hash) → true/false
↓
Backend: gera JWT token
↓
Frontend recebe: { token, usuario }
↓
Frontend salva em localStorage
↓
Frontend redireciona para dashboard
```

### 3. Usar Token
```
Usuário acessa rota protegida (ex: /api/descarte)
↓
Frontend envia: Authorization: Bearer <token>
↓
Backend: autenticar(req) → extrai token → jwt.verify()
↓
Backend: retorna usuário autenticado ou 401 Unauthorized
↓
Frontend usa os dados ou redireciona para login se expirou
```

---

## ⚠️ Problemas Comuns & Soluções

| Problema | Causa | Solução |
|----------|-------|--------|
| Erro 500 "Banco não configurado" | `DATABASE_URL` não está no Vercel | Ir em Settings → Env Vars → adicionar |
| Erro 409 "Email já cadastrado" | Usuário tentando cadastrar email que já existe | Usar outro email |
| Erro 401 "Não autorizado" | Token ausente ou expirado | Fazer login novamente |
| Erro "Unexpected token 'A'" | Servidor retorna HTML em vez de JSON | Verificar logs do Vercel (`vercel logs`) |
| Build falha | Erros TypeScript | Rodar `npx tsc --noEmit` localmente |

---

## 🔐 Segurança

- ✅ Senhas hasheadas com bcryptjs (10 rounds)
- ✅ JWT com expiração (7 dias)
- ✅ Tokens enviados no header `Authorization: Bearer`
- ✅ CORS configurado em `/api/auth/register`
- ⚠️ **TODO:** Adicionar rate limiting em endpoints de auth
- ⚠️ **TODO:** Implementar refresh tokens para renovar JWT sem fazer login novamente

---

## 📈 Próximas Features (Futuro)

1. Implementar endpoint `/api/descarte` com validação IA (Google Gemini)
2. Implementar upload de imagens para Vercel Blob
3. Implementar resgatar recompensas (`/api/recompensa`)
4. Implementar dashboard admin
5. Adicionar notificações em tempo real (WebSocket)
6. Testes automatizados (Jest + Vitest)

---

## ✨ Resumo

Você tem uma aplicação React + Node + PostgreSQL completamente funcional:
- **Frontend:** React com TypeScript, UI components, autenticação JWT
- **Backend:** 4 endpoints serverless (register, login, me, descarte) em Vercel Functions
- **Banco:** PostgreSQL no Neon com schema completo
- **Deploy:** Configurado para Vercel com suporte a variáveis de ambiente

**Próximo passo:** Adicione as variáveis de ambiente no Vercel e faça `vercel --prod` para publicar! 🚀

---

**Criado:** 30 de Novembro de 2025  
**Status:** ✅ Pronto para Produção
