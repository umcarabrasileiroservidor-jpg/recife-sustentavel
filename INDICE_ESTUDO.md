# 📚 Índice Completo de Estudo - Recife Sustentável

Bem-vindo ao seu material de estudo! Aqui você encontra tudo organizadinho para estudar para a prova. 🎓

---

## 📖 Documentos de Estudo

### 1. **GUIA_ESTUDO.md** ⭐ (COMECE AQUI!)
**O que é:** Um guia completo e detalhado explicando TUDO sobre o sistema.

**Contém:**
- Arquitetura geral do sistema
- O que é JWT (estrutura, como funciona)
- Como funciona autenticação (sessão vs JWT)
- Fluxo de Registro (passo a passo)
- Fluxo de Login (passo a passo)
- Fluxo de Descarte com Transações
- Estrutura do Banco de Dados (tabelas, campos)
- Conceitos-chave (HTTP, Headers, Placeholders SQL, Env Variables)
- Resumo de Segurança (o que fazer e não fazer)

**Quando usar:** Quando quer entender PROFUNDAMENTE um tópico. Leia com calma, absorva bem.

**Tempo de estudo:** 2-3 horas

---

### 2. **RESUMO_PROVA.md** ⚡ (ESTUDE ANTES DA PROVA!)
**O que é:** Resumo visual e rápido de todos os conceitos principais.

**Contém:**
- Fluxos em diagramas ASCII
- Resumo de JWT (estrutura)
- Resumo de Hash de Senha
- Status codes HTTP
- Transações SQL resumidas
- Middlewares e proteção
- Tabelas do banco (visão geral)
- Fluxo completo (tela de login)
- Segurança: nunca fazer vs sempre fazer

**Quando usar:** Para revisar rápido antes da prova (15-30 min de leitura).

**Tempo de estudo:** 30 minutos

---

### 3. **EXEMPLOS_CODIGO.md** 💻 (PRATIQUE O CÓDIGO!)
**O que é:** Código completo com explicações linha por linha.

**Contém:**
- Exemplo completo de REGISTRO
- Exemplo completo de LOGIN
- Exemplo completo de DESCARTE
- JWT: criar e validar
- Bcrypt: hash e comparação
- SQL Injection: seguro vs inseguro

**Quando usar:** Quando quer ver código de verdade funcionando. Copie, estude, execute.

**Tempo de estudo:** 2 horas (implemente cada exemplo)

---

### 4. **CHECKLIST_PROVA.md** ✅ (VERIFIQUE SEU CONHECIMENTO!)
**O que é:** Lista de verificação completa de tudo que você precisa saber.

**Contém:**
- ✅ Autenticação & Segurança
- ✅ Banco de Dados
- ✅ API & Endpoints
- ✅ Autenticação & Autorização
- ✅ Transações SQL
- ✅ Fluxos Completos
- ✅ Arquitetura
- ✅ Debugging
- ✅ Dicas para a prova

**Quando usar:** Para verificar se você sabe tudo. Marque o que já aprendeu!

**Tempo de estudo:** 1 hora (checklist)

---

### 5. **TESTE_API.md** 🧪 (TESTE OS ENDPOINTS!)
**O que é:** Guia para testar todos os endpoints da API.

**Contém:**
- Como iniciar o servidor (vercel dev)
- Comandos cURL para cada endpoint
- Resposta esperada de cada endpoint
- Troubleshooting comum
- Variáveis de ambiente

**Quando usar:** Para testar na prática se os endpoints estão funcionando.

**Tempo de estudo:** 1 hora (teste cada endpoint)

---

### 6. **SETUP_COMPLETO.md** 🚀
**O que é:** Resumo de como tudo foi configurado e como testar.

**Contém:**
- CORS configurado
- Banco de dados em português
- Endpoints listados
- Como testar com PowerShell
- Estrutura de respostas

**Quando usar:** Quando quer um resumo rápido do setup.

---

## 📁 Código Comentado (Estude Também!)

### `/src/lib/db.ts`
- Pool de conexão global
- Comentários sobre Serverless
- Como reutilizar conexões

### `/src/lib/auth.ts`
- Função `gerarToken()` - cria JWT
- Função `verificarToken()` - valida JWT
- Função `hashSenha()` - criptografa
- Função `compararSenha()` - valida senha
- Função `autenticar()` - middleware
- Cada função tem comentários detalhados

### `/src/api/auth/register.ts`
- Código de Registro comentado passo a passo
- Mostra validação, hash, insert, geração de token

### Outros endpoints
- `/src/api/auth/login.ts` - Login comentado
- `/src/api/descarte.ts` - Transação comentada
- `/src/api/signup.ts` - Alternativa a register
- `/src/api/login.ts` - Alternativa a auth/login

---

## 🎯 Plano de Estudo Recomendado

### Dia 1: Conceitos Fundamentais
1. ✅ Ler **RESUMO_PROVA.md** (30 min) - visão geral
2. ✅ Ler **GUIA_ESTUDO.md** - seções 1-2 (JWT) (1 hora)
3. ✅ Ler **GUIA_ESTUDO.md** - seções 3-5 (Fluxos) (1 hora)

**Total Dia 1:** 2.5 horas

### Dia 2: Código e Prática
1. ✅ Ler **EXEMPLOS_CODIGO.md** - Registro (30 min)
2. ✅ Copiar código e testar localmente (30 min)
3. ✅ Ler **EXEMPLOS_CODIGO.md** - Login (30 min)
4. ✅ Testar Login localmente (30 min)
5. ✅ Ler **EXEMPLOS_CODIGO.md** - Descarte (30 min)
6. ✅ Testar Descarte localmente (30 min)

**Total Dia 2:** 3 horas

### Dia 3: Banco de Dados e SQL
1. ✅ Ler **GUIA_ESTUDO.md** - Banco de Dados (1 hora)
2. ✅ Ler **EXEMPLOS_CODIGO.md** - SQL Injection (30 min)
3. ✅ Ler **CHECKLIST_PROVA.md** - Banco de Dados (30 min)

**Total Dia 3:** 2 horas

### Dia 4: Revisão e Consolidação
1. ✅ Marcar **CHECKLIST_PROVA.md** (1 hora)
2. ✅ Testar endpoints com **TESTE_API.md** (1 hora)
3. ✅ Fazer um novo endpoint (2 horas)

**Total Dia 4:** 4 horas

### Dia 5: Véspera da Prova
1. ✅ Revisar **RESUMO_PROVA.md** (20 min)
2. ✅ Revisar seus notes (30 min)
3. ✅ Responder algumas perguntas de prova (1 hora)
4. ✅ Descansar! 😴

**Total Dia 5:** 2 horas

---

## 💡 Dicas para Estudar Efetivamente

### 1️⃣ Não só leia - ENTENDA!
```
❌ Errado: Ler passivamente e esperar que entre na cabeça
✅ Certo: Ler, parar, explicar em voz alta o que aprendeu
```

### 2️⃣ Pratique o código
```
❌ Errado: Só ler exemplos de código
✅ Certo: Digitar, testar, modificar, quebrar e consertar
```

### 3️⃣ Faça diagramas
```
Desenhando um diagrama você aprende melhor!
Tente desenhar:
- Fluxo de Registro
- Estrutura JWT
- Transação de Descarte
```

### 4️⃣ Explique para alguém
```
Se conseguir explicar um conceito para um colega,
então você REALMENTE entendeu!
```

### 5️⃣ Faça perguntas
```
Ao invés de só ler:
- Por quê?
- Como?
- O que acontece se...?
- Qual é o alternativa?
```

---

## 🔍 Resolução Rápida de Dúvidas

### "Como começo?"
1. Leia **RESUMO_PROVA.md** (30 min)
2. Leia **GUIA_ESTUDO.md** com atenção
3. Pratique com **EXEMPLOS_CODIGO.md**

### "Não entendo JWT"
1. Leia **GUIA_ESTUDO.md** - seção "Fluxo de Autenticação JWT"
2. Veja diagramas em **RESUMO_PROVA.md**
3. Teste no TESTE_API.md - veja o token retornado

### "Qual a diferença entre Registro e Login?"
1. Leia **GUIA_ESTUDO.md** - seções 3 e 4
2. Compare no **EXEMPLOS_CODIGO.md**
3. Marque no **CHECKLIST_PROVA.md**

### "Não entendo SQL Injection"
1. Leia **EXEMPLOS_CODIGO.md** - última seção
2. Veja código comentado em `/src/api/auth/register.ts`
3. Compare inseguro vs seguro lado a lado

### "Como testo os endpoints?"
1. Siga **TESTE_API.md** passo a passo
2. Use os comandos cURL
3. Ou use Postman/Insomnia

---

## 📊 Mapa Conceitual

```
SEGURANÇA
├─ JWT
│  ├─ Estrutura (Header, Payload, Signature)
│  ├─ Geração (gerarToken)
│  ├─ Validação (verificarToken)
│  └─ Middleware (autenticar)
├─ Senha
│  ├─ Hash (bcryptjs.hash)
│  ├─ Comparação (bcryptjs.compare)
│  └─ Rounds (10)
└─ CORS
   └─ Headers de autorização

FLUXOS
├─ Registro
│  ├─ Validar → Hash → INSERT → Token → Retorno
│  └─ Status 201 Created
├─ Login
│  ├─ Buscar → Comparar → Token → Retorno
│  └─ Status 200 OK
└─ Descarte
   ├─ Autenticar → BEGIN → INSERT/UPDATE → COMMIT
   └─ Transação

BANCO DE DADOS
├─ Tabelas
│  ├─ usuarios (id, nome, email, senha_hash, saldo_pontos)
│  ├─ descartes (usuario_id, tipo_residuo, pontos_ganhos)
│  ├─ transacoes (usuario_id, tipo, valor)
│  └─ recompensas (titulo, custo_pontos, ativo)
├─ SQL
│  ├─ SELECT, INSERT, UPDATE, DELETE
│  ├─ Foreign Keys
│  ├─ Constraints (UNIQUE, CHECK, DEFAULT)
│  └─ Placeholders ($1, $2, $3)
└─ Segurança
   └─ Prevenir SQL Injection

API
├─ Endpoints
│  ├─ POST /api/auth/register
│  ├─ POST /api/auth/login
│  ├─ POST /api/descarte
│  ├─ GET /api/usuarios/[id]
│  ├─ PUT /api/usuarios/[id]
│  └─ GET /api/recompensas/list
├─ HTTP
│  ├─ Methods (GET, POST, PUT, DELETE)
│  ├─ Status (200, 201, 400, 401, 404, 500)
│  └─ Headers
└─ CORS

ARQUITETURA
├─ Frontend (React)
├─ API (Vercel Functions)
├─ Database (PostgreSQL Neon)
└─ Serverless (Pool global, stateless)
```

---

## ✨ Você Consegue!

Esse sistema é bem estruturado e você tem todo o material para entender perfeitamente.

Não é simplesmente decorar código - é **ENTENDER A LÓGICA** por trás.

Se em algum momento ficar confuso:
1. ✅ Pare e respire
2. ✅ Volta ao documento específico
3. ✅ Leia mais devagar
4. ✅ Tente um exemplo
5. ✅ Peça ajuda se precisar

---

**Agora vá estudar! 🚀**

**Sucesso na prova! 💪**

---

## 📞 Referência Rápida

| Preciso de... | Leio... |
|---|---|
| Visão geral completa | GUIA_ESTUDO.md |
| Revisão rápida | RESUMO_PROVA.md |
| Ver código funcionando | EXEMPLOS_CODIGO.md |
| Verificar se aprendi | CHECKLIST_PROVA.md |
| Testar endpoints | TESTE_API.md |
| Conceito específico? | Procura em GUIA_ESTUDO.md |
| Não entende uma função | Vê código comentado em src/ |

