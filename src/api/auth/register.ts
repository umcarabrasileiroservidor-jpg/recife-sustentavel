/**
 * ============================================
 * ARQUIVO: src/api/auth/register.ts
 * DESCRIÇÃO: Endpoint POST para REGISTRAR novo usuário
 * ============================================
 * 
 * URL: POST /api/auth/register
 * 
 * O QUE FAZ:
 * - Recebe dados do novo usuário (nome, email, senha, cpf, telefone)
 * - Valida os dados (nome, email, senha são obrigatórios)
 * - Criptografa a senha com bcrypt (para não guardar em texto plano)
 * - Insere o usuário na tabela "usuarios" do banco
 * - Gera um JWT token para login automático
 * - Retorna o token + dados do usuário
 * 
 * FLUXO COMPLETO:
 * 1. Cliente envia POST /api/auth/register com { nome, email, senha, cpf, telefone }
 * 2. API recebe a requisição (req) e resposta (res)
 * 3. Configura headers CORS para o front conseguir chamar
 * 4. Se METHOD for OPTIONS: retorna 200 (preflight request)
 * 5. Se METHOD não for POST: retorna erro 405
 * 6. Extrai dados do req.body
 * 7. Valida se nome, email e senha foram fornecidos
 * 8. Criptografa a senha com hashSenha()
 * 9. Insere na tabela usuarios com INSERT
 * 10. Gera JWT token com gerarToken()
 * 11. Retorna status 201 + { success, token, usuario }
 * 12. Se email já existe: retorna erro 409 (Conflict)
 * 13. Se outro erro: retorna erro 500
 */

import pool from '../../lib/db';
import { hashSenha, gerarToken } from '../../lib/auth';

/**
 * HANDLER PRINCIPAL
 * Esta é a função que o Vercel executa quando recebe uma requisição POST /api/auth/register
 */
export default async function handler(req: any, res: any) {
  // ============================================
  // PASSO 1: CONFIGURAR CORS
  // ============================================
  // CORS permite que um domínio chamar endpoints de outro domínio
  // Como nosso FRONT está em http://localhost:3000 e API também,
  // mas em ambiente de produção podem estar em domínios diferentes
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  // Permite requisições de qualquer origem (poderia ser mais restritivo)
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Permite os métodos: GET, POST, PUT, DELETE, PATCH, OPTIONS
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  // Permite headers customizados (Content-Type, Authorization, etc)
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // ============================================
  // PASSO 2: LIDAR COM PREFLIGHT REQUEST
  // ============================================
  // Quando o navegador quer fazer uma requisição complexa (POST com JSON),
  // primeiro faz uma requisição OPTIONS (preflight) para saber se é permitido
  // Se recebermos OPTIONS, respondemos 200 OK
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ============================================
  // PASSO 3: VALIDAR MÉTODO HTTP
  // ============================================
  // Este endpoint SÓ aceita POST
  // Se alguém tentar GET, PUT, DELETE, etc.: erro 405 Method Not Allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ============================================
    // PASSO 4: EXTRAIR DADOS DA REQUISIÇÃO
    // ============================================
    // req.body contém o JSON que o cliente enviou
    // Desestruturamos para pegar: nome, email, senha, cpf, telefone
    const { nome, email, senha, cpf, telefone } = req.body;

    // ============================================
    // PASSO 5: VALIDAÇÃO DE DADOS OBRIGATÓRIOS
    // ============================================
    // Nome, email e senha são OBRIGATÓRIOS
    // CPF e telefone são OPCIONAIS (podem ser null)
    if (!nome || !email || !senha) {
      // Se faltar algum, retorna erro 400 Bad Request
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    // ============================================
    // PASSO 6: CRIPTOGRAFAR SENHA
    // ============================================
    // NUNCA guardamos senha em texto plano no banco!
    // hashSenha() usa bcrypt para criar um hash irreversível
    // Exemplo: "senha123" vira "$2a$10$JV8I7H5dZ.fG9e7K3m2L1OmN5p4O3qRs2T1UvWxYz..."
    const senhaHash = await hashSenha(senha);

    // ============================================
    // PASSO 7: INSERIR USUÁRIO NO BANCO
    // ============================================
    // SQL: INSERT INTO usuarios (nome, email, senha_hash, cpf, telefone, saldo_pontos, nivel_usuario)
    //      VALUES ($1, $2, $3, $4, $5, 50, 'Iniciante')
    // 
    // Explicação:
    // - $1, $2, $3... são placeholders para prevenir SQL injection
    // - cpf e telefone podem ser null (|| null se não fornecidos)
    // - saldo_pontos começa com 50 (pontos iniciais)
    // - nivel_usuario começa como 'Iniciante'
    // - RETURNING retorna os dados inseridos para usarmos na resposta
    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, cpf, telefone, saldo_pontos, nivel_usuario)
       VALUES ($1, $2, $3, $4, $5, 50, 'Iniciante')
       RETURNING id, nome, email, cpf, telefone, saldo_pontos, nivel_usuario`,
      [nome, email, senhaHash, cpf || null, telefone || null]
    );

    // Pega o primeiro (e único) resultado retornado do INSERT
    const usuario = result.rows[0];

    // ============================================
    // PASSO 8: GERAR JWT TOKEN
    // ============================================
    // Agora que o usuário foi criado, geramos um token JWT
    // Esse token contém: userId, email
    // Token válido por 7 dias
    // Cliente vai guardar esse token no localStorage para fazer login automático
    const token = gerarToken(usuario.id, usuario.email);

    // ============================================
    // PASSO 9: RETORNAR SUCESSO
    // ============================================
    // Status 201 Created (novo recurso foi criado com sucesso)
    // Retorna: token (para usar em requisições futuras) + dados do usuário
    return res.status(201).json({
      success: true,
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cpf: usuario.cpf,
        telefone: usuario.telefone,
        saldo_pontos: usuario.saldo_pontos,
        nivel_usuario: usuario.nivel_usuario,
      },
    });

  } catch (error: any) {
    // ============================================
    // TRATAMENTO DE ERROS
    // ============================================
    console.error('Erro ao registrar:', error);

    // Erro 23505 é código PostgreSQL para violação de constraint UNIQUE
    // Significa: email já existe no banco (constraint UNIQUE em email)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // Qualquer outro erro: retorna erro genérico 500 Internal Server Error
    return res.status(500).json({ error: error.message || 'Erro interno' });
  }
}
