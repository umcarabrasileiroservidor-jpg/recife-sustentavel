# 🚨 PÁGINA EM BRANCO? Solução em 3 Passos

Se você acessou o site e vê uma página em branco, siga EXATAMENTE estes 3 passos:

## ✅ PASSO 1: Verificar o Console (2 minutos)

1. **Abra o site** (a URL que o Vercel te deu)
2. **Pressione `F12`** no teclado (abre Developer Tools)
3. **Clique na aba `Console`** (deve estar em azul)
4. **Procure por texto em vermelho** (erro)

### Cenários Possíveis:

**❌ Se vir erro em vermelho:**
- Copie o erro completo
- Abra `TROUBLESHOOTING.md` no repositório
- Procure o erro na lista
- Siga a solução correspondente

**✅ Se NÃO vir erro no console:**
- Significa que o JavaScript carregou OK
- O problema é de renderização da UI
- Vá para o PASSO 2

---

## ✅ PASSO 2: Verificar Variáveis de Ambiente (5 minutos)

**ISTO É O MAIS IMPORTANTE!** O site não funciona sem estas variáveis no Vercel.

1. **Abra:** https://vercel.com/kerllons-projects-ae21a1bb/recife-sustentavel-app-main
2. **Clique em:** `Settings` (à direita)
3. **Clique em:** `Environment Variables` (no menu esquerdo)
4. **Verifique se tem EXATAMENTE estas 4 variáveis:**

| Nome | Presente? | Tipo |
|------|-----------|------|
| `DATABASE_URL` | ? | Production |
| `JWT_SECRET` | ? | Production |
| `BLOB_READ_WRITE_TOKEN` | ? | Production |
| `GOOGLE_API_KEY` | ? | Production |

### Se FALTAM variáveis:

1. **Abra seu arquivo `.env.local`** neste repositório
2. **Copie o valor** de cada variável (ex: `DATABASE_URL=postgresql://...`)
3. **No Vercel, clique em `Add New`**:
   - Nome: `DATABASE_URL`
   - Valor: _copie da `.env.local`_
   - Marque: `Production` ✅
   - Clique: `Save`

4. **Repita para cada variável**

5. **Após salvar TODAS, faça o deploy novamente:**
```powershell
vercel --prod
```

6. **Aguarde 2-3 minutos** (Vercel precisa reconstruir)

7. **Atualize o navegador** (Ctrl+F5 ou Cmd+Shift+R)

---

## ✅ PASSO 3: Testar Localmente (Alternativa)

Se preferir testar antes de fazer deploy:

```powershell
# Terminal
vercel dev

# Navegador
# Abra: http://localhost:3000
# Pressione F12 → Console
# Procure por erros
```

Se funcionar localmente, confirme que as variáveis estão no Vercel (PASSO 2) e faça deploy novamente.

---

## 🎯 Resumo Rápido

| Problema | Solução |
|----------|---------|
| Página em branco + Console sem erros | Variáveis não configuradas no Vercel (PASSO 2) |
| Página em branco + Erro no Console | Ver `TROUBLESHOOTING.md` |
| Funciona localmente mas não em produção | Verificar Env Vars no Vercel (PASSO 2) + fazer `vercel --prod` |
| Erro 500 ao tentar cadastrar | `DATABASE_URL` inválida ou não configurada |

---

## 📞 Precisa de Ajuda?

1. **Viu algum erro? Procure em:** `TROUBLESHOOTING.md`
2. **Dúvida sobre env vars?** Abra: `ENV_SETUP_VERCEL.md`
3. **Quer testar localmente?** Rode: `vercel dev`

🚀 **Depois que configurar as env vars, tudo deve funcionar!**
