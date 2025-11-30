# 🔍 Troubleshooting — Página em Branco ("Tudo Branco")

Se você abriu o site e a página aparece em branco, aqui estão as causas mais comuns e soluções.

## 1️⃣ Verificar Erros no Console (Passo Mais Importante!)

**No navegador:**
1. Pressione `F12` (abre Developer Tools)
2. Clique na aba **Console**
3. Procure por mensagens em **vermelho** (erros)
4. Copie o erro completo e compare com a seção correspondente abaixo

---

## 2️⃣ Causas Comuns

### A. Erro: "Cannot find module" ou "Failed to fetch"

**Causa:** Um módulo JavaScript não foi carregado corretamente.

**Solução:**
```powershell
# Limpar dist e recompilar
rm -Recurse -Force dist
npm run build
```

Se o erro persistir, verifique se há imports com sufixo de versão em componentes. Procure por:
```typescript
import { ... } from 'nome-do-pacote@x.y.z'  // ❌ ERRADO
import { ... } from 'nome-do-pacote'         // ✅ CERTO
```

---

### B. Erro: "CORS error" ou "Access to XMLHttpRequest blocked"

**Causa:** O frontend tenta chamar a API mas a requisição é bloqueada.

**Solução:**
1. Verifique que os endpoints têm CORS habilitado:
   - `src/api/auth/register.ts` tem headers CORS ✅
   - `src/api/auth/login.ts` tem headers CORS?
   - `src/api/me.ts` tem headers CORS?
   - `src/api/descarte.ts` tem headers CORS?

2. Se falta CORS, adicione no início do handler:
```typescript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

if (req.method === 'OPTIONS') {
  return res.status(200).end();
}
```

---

### C. Erro: "Unexpected token" ou "JSON parse error"

**Causa:** A API retorna HTML/texto em vez de JSON.

**Solução:**
- Verificar se há erro no backend (`vercel logs`)
- Confirmar que `DATABASE_URL` foi configurada no Vercel
- Testar localmente com `vercel dev`

---

### D. Erro: "Cannot read property 'children' of null"

**Causa:** Contexto React não está disponível ou há erro ao renderizar componentes.

**Solução:**
1. Verificar se `<UserProvider>` envolve toda a app em `App.tsx`:
```tsx
return (
  <UserProvider>
    <div>...</div>
  </UserProvider>
)
```

2. Verificar se `UserContext.tsx` não tem erros de import.

---

### E. Página Totalmente em Branco (nem skeleton aparece)

**Causa mais comum:** JavaScript não carregou por erro de sintaxe ou import.

**Solução:**

1. **Teste localmente:**
```powershell
vercel dev
# Abra http://localhost:3000 e verifique console (F12)
```

2. **Se o erro ainda não aparece,** tente:
```powershell
npm run build
npx http-server dist -p 3000
# Abra http://localhost:3000
```

3. **Se funciona localmente mas não em produção:**
   - O Vercel pode não ter as variáveis de ambiente
   - Ir em **Settings → Environment Variables** no dashboard
   - Confirmar que `DATABASE_URL`, `JWT_SECRET` estão configuradas

---

## 3️⃣ Verificar Build e Deployment

### Verificar se o Build está OK

```powershell
npm run build
# Deve criar pasta dist/ com index.html e assets/
Get-ChildItem dist/
```

Esperado:
```
Mode       Name
----       ----
d-----     assets
-a----     index.html
```

### Verificar se há erros de TypeScript

```powershell
npx tsc --noEmit
# Não deve retornar nada (significa sem erros)
```

### Verificar Logs do Vercel

```powershell
vercel logs recife-sustentavel-app-main --since 10m
```

Procure por:
- Erros de parsing JSON
- Erros de conexão com BD
- Stack traces

---

## 4️⃣ Checklist Rápido

- [ ] Abriu console (F12) e viu erros em vermelho?
- [ ] Copiou o erro e comparou com seções acima?
- [ ] Rodou `npm run build` novamente?
- [ ] Testou localmente com `vercel dev`?
- [ ] Confirmou `DATABASE_URL` no Vercel Dashboard?
- [ ] Fez `vercel --prod` depois de atualizar variáveis?

---

## 5️⃣ Se Nada Funcionar

**Último recurso — redeploy forçado:**

```powershell
# Limpar cache do Vercel
vercel env pull                # Sincronizar env vars
npm install                    # Garantir dependências
npm run build                  # Build local
vercel --prod --force          # Deploy forçado
```

Após isso, aguarde 2-3 minutos (Vercel processa builds) e acesse a URL novamente.

---

## 📞 Debug Checklist

Se mesmo assim não funcionar, crie um relatório com:

1. **URL do site:** https://recife-sustentavel-app-main-...vercel.app
2. **Erro do console (F12):** _copie aqui_
3. **Resultado de:** `vercel logs recife-sustentavel-app-main --since 10m`
4. **Se funciona localmente:** sim / não

Isso ajudará a identificar o problema!
