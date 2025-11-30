# ✅ Checklist de Estudo - Prova Recife Sustentável

## 📋 Autenticação & Segurança

### JWT (JSON Web Token)
- [ ] Entendo o que é JWT e por que usar em APIs
- [ ] Consigo explicar as 3 partes: Header, Payload, Signature
- [ ] Entendo que JWT é STATELESS (servidor não guarda nada)
- [ ] Sei que JWT expira (padrão 7 dias neste projeto)
- [ ] Entendo por que JWT é melhor que sessão em Serverless
- [ ] Consigo decodificar um JWT e explicar cada campo
- [ ] Entendo que qualquer pessoa pode LER um JWT (é base64)
- [ ] Mas NÃO consegue modificar (precisa da chave secreta)

### Senha & Bcrypt
- [ ] Entendo que NUNCA guardar senha em texto plano
- [ ] Consigo explicar como bcrypt funciona (hash + salt)
- [ ] Entendo "rounds" (10 = força do hash)
- [ ] Entendo que cada execução gera hash DIFERENTE
- [ ] Entendo que hash é IRREVERSÍVEL (não dá voltar)
- [ ] Sei que `bcryptjs.compare()` não usa `===`
- [ ] Consigo comparar: $2a$10$... vs "texto plano"

### Fluxo de Registro
- [ ] Entendo os passos: validar → hash → insert → gerar token
- [ ] Sei que usuário novo começa com 50 pontos (Capivaras)
- [ ] Entendo que email deve ser ÚNICO (constraint UNIQUE)
- [ ] Consigo identificar o código que faz cada etapa
- [ ] Entendo o que significa "status 201 Created"
- [ ] Entendo o que significa "status 409 Conflict" (email duplicado)
- [ ] Sei que frontend salva token em localStorage

### Fluxo de Login
- [ ] Entendo os passos: buscar → comparar senha → gerar token
- [ ] Sei que erro deve ser genérico "Email ou senha inválidos"
- [ ] Entendo por quê: não revela se email existe ou não
- [ ] Entendo Timing Attack (problema de segurança)
- [ ] Consigo comparar com Registro (qual é a diferença?)
- [ ] Entendo "status 200 OK" vs "status 201 Created"
- [ ] Entendo "status 401 Unauthorized"

---

## 🗄️ Banco de Dados

### Tabela: usuarios
- [ ] Sei que id é UUID (não inteiro)
- [ ] Entendo por que UUID é melhor que id sequencial
- [ ] Entendo "UNIQUE" em email (não pode repetir)
- [ ] Entendo que senha_hash é string (não é número)
- [ ] Entendo "saldo_pontos INTEGER" (inteiro, não decimal)
- [ ] Sei que nivel_usuario começa com "Iniciante"
- [ ] Entendo "criado_em" e "atualizado_em" timestamps

### Tabela: descartes
- [ ] Entendo que usuario_id é Foreign Key
- [ ] Entendo que Foreign Key referencia usuarios(id)
- [ ] Sei que tipo_residuo é "Plastico", "Metal", "Papel", etc
- [ ] Entendo que multiplicador_volume é 1.0, 1.5, 2.0
- [ ] Entendo que pontos_ganhos = pontos_base × multiplicador
- [ ] Entendo que validado_ia é true/false (IA validou?)

### Tabela: transacoes
- [ ] Entendo que tipo tem CHECK constraint (ganho, resgate, penalidade)
- [ ] Entendo que é um LOG (auditoria) de cada operação
- [ ] Entendo que valor pode ser positivo (ganho) ou negativo (gasto)
- [ ] Entendo que CREATE registra quando foi feita

### Conceitos SQL
- [ ] Entendo SELECT, INSERT, UPDATE, DELETE
- [ ] Consigo ler e modificar um SELECT... WHERE
- [ ] Entendo o que é PRIMARY KEY
- [ ] Entendo o que é FOREIGN KEY (relacionamento)
- [ ] Entendo o que é UNIQUE (não pode repetir)
- [ ] Entendo o que é CHECK (validação de valores)
- [ ] Entendo DEFAULT (valor padrão)
- [ ] Entendo RETURNING (retorna o que foi inserido)

### SQL Injection
- [ ] Entendo o risco de concatenar strings em SQL
- [ ] Sei que `$1, $2, $3...` são placeholders SEGUROS
- [ ] Consigo reconhecer SQL injection em um código
- [ ] Consigo corrigir um código vulnerável

---

## 🔌 API & Endpoints

### HTTP Status Codes
- [ ] 200 OK = Tudo certo
- [ ] 201 Created = Novo recurso criado (POST /register)
- [ ] 400 Bad Request = Dados inválidos
- [ ] 401 Unauthorized = Token inválido/expirado
- [ ] 403 Forbidden = Sem permissão
- [ ] 404 Not Found = URL não existe
- [ ] 409 Conflict = Email já cadastrado
- [ ] 500 Internal Error = Erro no servidor

### HTTP Methods
- [ ] GET = ler dados (seguro, sem efeito colateral)
- [ ] POST = criar dados (não seguro)
- [ ] PUT = atualizar tudo (não seguro)
- [ ] DELETE = deletar (não seguro)
- [ ] PATCH = atualizar parcialmente (não seguro)
- [ ] OPTIONS = preflight do CORS

### Headers HTTP
- [ ] `Content-Type: application/json` = estamos enviando JSON
- [ ] `Authorization: Bearer <token>` = token JWT
- [ ] `Access-Control-Allow-Origin: *` = CORS (permite outros domínios)
- [ ] `Access-Control-Allow-Methods: GET,POST,...` = quais métodos permitem

### Endpoints do Sistema
- [ ] POST /api/auth/register - Criar novo usuário
- [ ] POST /api/auth/login - Fazer login
- [ ] POST /api/descarte - Registrar coleta de lixo
- [ ] PUT /api/usuarios/[id] - Atualizar perfil
- [ ] GET /api/usuarios/[id] - Ver perfil
- [ ] GET /api/recompensas/list - Listar recompensas

---

## 🔐 Autenticação & Autorização

### Middleware autenticar()
- [ ] Entendo que middleware é "função que filtra requisições"
- [ ] Consigo ler o código que extrai token do header
- [ ] Entendo que se não houver token: retorna null
- [ ] Entendo que verifica assinatura do JWT
- [ ] Entendo que se expirado: retorna null
- [ ] Consigo usar autenticar() para proteger endpoints
- [ ] Entendo que após autenticar() temos payload.userId

### Fluxo de Requisição Autenticada
- [ ] Frontend lê token do localStorage
- [ ] Frontend envia: `Authorization: Bearer <token>`
- [ ] Backend extrai header
- [ ] Backend extrai token (remove "Bearer ")
- [ ] Backend valida assinatura
- [ ] Backend valida expiração
- [ ] Se OK: tem payload.userId
- [ ] Se erro: retorna 401

---

## 💾 Transações SQL

### O que é?
- [ ] Entendo que é um bloco de operações ATÔMICO
- [ ] Entendo que é TUDO ou NADA (não pode ficar no meio)
- [ ] Entendo por que é importante para consistência

### BEGIN, COMMIT, ROLLBACK
- [ ] Entendo BEGIN = iniciar transação
- [ ] Entendo COMMIT = salvar tudo (permanente)
- [ ] Entendo ROLLBACK = desfazer tudo (volta ao início)
- [ ] Consigo escrever uma transação
- [ ] Entendo exemplo do descarte:
  - BEGIN
  - INSERT descarte
  - UPDATE saldo
  - INSERT transacao
  - COMMIT
- [ ] Entendo que se UPDATE der erro: ROLLBACK

### Por que usar?
- [ ] Previne inconsistência (ex: saldo não atualizando)
- [ ] Garante que se falhar no meio: tudo volta
- [ ] É importante em operações críticas (dinheiro, pontos)

---

## 🎯 Fluxos Completos

### Fluxo de Registro
- [ ] Usuário preenche formulário
- [ ] Frontend valida (todos campos?)
- [ ] Frontend POST /api/auth/register
- [ ] Backend valida
- [ ] Backend hash senha
- [ ] Backend INSERT usuarios
- [ ] Backend gera token
- [ ] Backend retorna token + usuario
- [ ] Frontend salva no localStorage
- [ ] Frontend redireciona para /home

### Fluxo de Login
- [ ] Usuário entra email e senha
- [ ] Frontend POST /api/auth/login
- [ ] Backend SELECT * WHERE email = ?
- [ ] Backend compara bcryptjs.compare()
- [ ] Se OK: gera token
- [ ] Se falha: retorna 401
- [ ] Frontend salva token
- [ ] Frontend redireciona

### Fluxo de Descarte
- [ ] Frontend lê token
- [ ] Frontend POST /api/descarte com Authorization header
- [ ] Backend autenticar() extrai payload
- [ ] Backend BEGIN TRANSACTION
- [ ] Backend INSERT descartes
- [ ] Backend UPDATE usuarios saldo
- [ ] Backend INSERT transacoes
- [ ] Backend COMMIT
- [ ] Backend retorna { points: X }
- [ ] Frontend soma pontos localmente

---

## 🚀 Arquitetura

### Serverless
- [ ] Entendo que cada requisição é isolada
- [ ] Entendo que não há memória compartilhada
- [ ] Entendo que precisa de pool global (globalThis)
- [ ] Entendo que precisamos reutilizar conexões

### Frontend → API → Database
- [ ] React envia fetch()
- [ ] Vercel Functions recebe
- [ ] Valida e processa
- [ ] Acessa banco Neon
- [ ] Retorna JSON
- [ ] Frontend recebe e atualiza UI

### Ambiente (.env.local)
- [ ] DATABASE_URL = connection string do Neon
- [ ] JWT_SECRET = chave para assinar tokens
- [ ] BLOB_READ_WRITE_TOKEN = token para uploads
- [ ] Nunca comitar em GitHub
- [ ] Diferentes valores por ambiente

---

## 🐛 Debugging & Troubleshooting

### Erros Comuns
- [ ] "Cannot find module" = import path errado
- [ ] "UNIQUE constraint failed" = email duplicado
- [ ] "Token inválido" = JWT_SECRET diferente ou expirado
- [ ] "Connection timeout" = DATABASE_URL errado
- [ ] "CORS error" = headers CORS não configurados
- [ ] "Request body undefined" = Content-Type não é application/json

### Como Debugar
- [ ] Usar console.error() para logs
- [ ] Usar console.log() para ver valores
- [ ] Testar endpoints com curl ou Postman
- [ ] Verificar .env.local
- [ ] Verificar import paths
- [ ] Verificar SQL syntax

---

## 📝 Para Escrever na Prova

### Se pedir "Implemente um novo endpoint"
- [ ] Criar arquivo em src/api/...
- [ ] Validar método HTTP
- [ ] Configurar CORS
- [ ] Extrair dados do req.body
- [ ] Validar dados (obrigatórios?)
- [ ] Usar try/catch
- [ ] Se precisa autenticação: chamar autenticar()
- [ ] Executar SQL com placeholders
- [ ] Retornar JSON com status correto

### Se pedir "Explique JWT"
- [ ] O que é (token estateless)
- [ ] Estrutura (Header.Payload.Signature)
- [ ] Por que usar (escalável em Serverless)
- [ ] Como valida (assinatura com chave secreta)
- [ ] Tempo de expiração
- [ ] Não é criptografia (é base64)

### Se pedir "Compare Sessão vs JWT"
- [ ] Sessão = servidor guarda dados na memória
- [ ] JWT = servidor não guarda nada
- [ ] Sessão = não escalável em Serverless
- [ ] JWT = escalável
- [ ] Sessão = mais seguro (servidor controla)
- [ ] JWT = mais rápido (sem lookup)

### Se pedir "Explique Bcrypt"
- [ ] O que é (hash de senha)
- [ ] Por que usar (irreversível, salt)
- [ ] Rounds (10 = força)
- [ ] Comparação (bcryptjs.compare)
- [ ] Nunca usar === para comparar

---

## 🎓 Dicas Finais

✅ **Faça:**
- [ ] Entender POR QUE cada coisa (não só memorizar)
- [ ] Praticar escrever código
- [ ] Entender fluxo de dados completo
- [ ] Ler os comentários no código
- [ ] Fazer os exemplos passo-a-passo
- [ ] Testar endpoints localmente
- [ ] Desenhar diagramas de fluxo

❌ **Evite:**
- [ ] Decorar sem entender
- [ ] Pular etapas
- [ ] Assumir que sabe sem testar
- [ ] Ignorar erros (debugar sempre!)
- [ ] Fazer requests sem verificar método/status code

📚 **Recursos:**
- [ ] GUIA_ESTUDO.md - Explicação completa
- [ ] RESUMO_PROVA.md - Resumo rápido
- [ ] EXEMPLOS_CODIGO.md - Código passo-a-passo
- [ ] Código comentado nos arquivos .ts

---

**Boa sorte na prova! Você consegue! 💪🚀**
