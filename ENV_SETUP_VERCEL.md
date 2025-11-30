# Configurar Variáveis de Ambiente no Vercel

O erro "Erro interno ao registrar usuário" ou "A server e..." ocorre porque o Vercel não consegue acessar o banco de dados. Isso acontece quando as variáveis de ambiente não estão configuradas no projeto Vercel (o arquivo `.env.local` é apenas local, não é enviado para produção).

## 3 Passos para Configurar as Variáveis

### Passo 1: Obter os Valores (já estão em `.env.local`)

Abra `.env.local` e copie os valores:

```env
DATABASE_URL=postgresql://...  # URL do Neon
JWT_SECRET=segredo-super-...    # Segredo JWT
BLOB_READ_WRITE_TOKEN=vercel... # Token Vercel Blob (opcional para descarte)
GOOGLE_API_KEY=AlzaSy...        # Google Gemini key (opcional para IA validator)
```

### Passo 2: Abrir Dashboard do Vercel

1. Acesse: https://vercel.com/kerllons-projects-ae21a1bb/recife-sustentavel-app-main
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Environment Variables** (Variáveis de Ambiente)

### Passo 3: Adicionar Cada Variável

Para cada variável, clique em **Add New** e preencha:

| Nome | Valor | Production |
|------|-------|------------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_...` | ✓ |
| `JWT_SECRET` | `segredo-super-secreto-do-projeto-recife-2025` | ✓ |
| `BLOB_READ_WRITE_TOKEN` | `vercel_blob_rw_zk1f...` | ✓ |
| `GOOGLE_API_KEY` | `AlzaSyAO2sLQe...` | ✓ |

**Importante:** Certifique-se de marcar **Production** para cada uma (o checkbox verde).

### Passo 4: Fazer Deploy Novamente

Após salvar, faça um novo deploy:

```powershell
vercel --prod
```

Ou use o dashboard do Vercel e clique em **Redeploy**.

---

## Testar Localmente com Vercel Dev

Se quiser testar localmente antes de fazer deploy em produção:

```powershell
# Baixar variáveis do Vercel (para local)
vercel env pull

# Rodar Vercel localmente
vercel dev
```

Então acesse `http://localhost:3000` e tente cadastrar. Os logs aparecerão no terminal.

---

## Solução de Problemas

**Erro: "Banco de dados não configurado"**
- Verifique se `DATABASE_URL` foi adicionada corretamente no Vercel.
- Certifique-se de que marcou **Production** no dashboard.

**Erro: "Email já cadastrado"**
- Normal! Significa que o banco conectou. Tente um email novo.

**Erro: "Corpo da requisição inválido"**
- O cliente está enviando JSON malformado. Verifique o `Login.tsx`.

---

## Após Configurar

Seu aplicativo estará online em:
- **URL:** https://recife-sustentavel-app-main-...vercel.app
- **APIs:** `/api/auth/register`, `/api/auth/login`, `/api/descarte`, `/api/me`
