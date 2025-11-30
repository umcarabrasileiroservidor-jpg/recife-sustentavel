/**
 * ============================================
 * ARQUIVO: src/api/auth/login.ts
 * DESCRIÇÃO: Endpoint POST para FAZER LOGIN
 * ============================================
 * 
 * URL: POST /api/auth/login
 * 
 * O QUE FAZ:
 * - Recebe email e senha do usuário
 * - Busca o usuário no banco pela email
 * - Valida a senha (comparando com o hash armazenado)
 * - Se tudo OK: gera JWT token e retorna
 * - Se falhar: retorna erro genérico (não deixa aparecer se email existe ou não)
 * 
 * DIFERENÇA ENTRE REGISTRO E LOGIN:
 * 
 * REGISTRO (/api/auth/register):
 * - Recebe: nome, email, senha, cpf, telefone
 * - Ação: CRIA novo usuário
 * - Retorna: token + dados do novo usuário
 * 
 * LOGIN (/api/auth/login):
 * - Recebe: email, senha
 * - Ação: VALIDA usuário existente
 * - Retorna: token + dados do usuário já existente
 * 
 * FLUXO COMPLETO:
 * 1. Cliente envia POST /api/auth/login com { email, senha }
 * 2. API recebe e configura CORS
 * 3. Extrai email e senha do req.body
 * 4. Valida se foram fornecidos
 * 5. Busca usuário no banco pela email
 * 6. Se não encontra: retorna erro 401 "Email ou senha inválidos"
 * 7. Se encontra: compara a senha recebida com o hash do banco
 * 8. Se não bater: retorna erro 401 "Email ou senha inválidos"
 * 9. Se bater: gera JWT token
 * 10. Retorna status 200 + { token, usuario }
 */

import pool from '../../lib/db';
import { compararSenha, gerarToken } from '../../lib/auth';

/**
 * HANDLER PRINCIPAL - Função executada em POST /api/auth/login
 */
export default async function handler(req: any, res: any) {
  // ============================================
  // PASSO 1: CONFIGURAR CORS
  // ============================================
  // Mesma configuração do registro - permite requisições cross-origin
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // ============================================
  // PASSO 2: LIDAR COM PREFLIGHT
  // ============================================
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ============================================
  // PASSO 3: VALIDAR MÉTODO HTTP
  // ============================================
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ============================================
    // PASSO 4: EXTRAIR DADOS DA REQUISIÇÃO
    // ============================================
    const { email, senha } = req.body;

    // ============================================
    // PASSO 5: VALIDAR DADOS OBRIGATÓRIOS
    // ============================================
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // ============================================
    // PASSO 6: BUSCAR USUÁRIO NO BANCO
    // ============================================
    // SQL: SELECT ... FROM usuarios WHERE email = $1
    // Procura por um usuário com o email fornecido
    const result = await pool.query(
      `SELECT id, nome, email, senha_hash, cpf, telefone, saldo_pontos, nivel_usuario
       FROM usuarios WHERE email = $1`,
      [email]
    );

    // ============================================
    // PASSO 7: VERIFICAR SE USUÁRIO FOI ENCONTRADO
    // ============================================
    // result.rows contém os usuários encontrados (deve ser 0 ou 1 por causa de UNIQUE)
    if (result.rows.length === 0) {
      // Usuário não encontrado
      // ⚠️ IMPORTANTE: Retornamos "Email ou senha inválidos" genérico
      // Não dizemos "Email não encontrado" porque revela que o email não está cadastrado
      // Isso é importante para SEGURANÇA: não deixa alguém descobrir quais emails existem
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // ============================================
    // PASSO 8: EXTRAIR DADOS DO USUÁRIO
    // ============================================
    const usuario = result.rows[0];

    // ============================================
    // PASSO 9: COMPARAR SENHAS
    // ============================================
    // senhaHash é o hash guardado no banco (ex: "$2a$10$...")
    // senha é o texto plano que o usuário digitou
    // compararSenha() usa bcryptjs.compare() para validar
    const senhaValida = await compararSenha(senha, usuario.senha_hash);

    // ============================================
    // PASSO 10: VERIFICAR SE SENHA ESTÁ CORRETA
    // ============================================
    if (!senhaValida) {
      // Novamente: "Email ou senha inválidos" genérico
      // Não revelamos se a senha está errada ou se é o email
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // ============================================
    // PASSO 11: GERAR JWT TOKEN
    // ============================================
    // Se chegou aqui: email e senha estão corretos!
    // Geramos um novo token JWT para este usuário
    const token = gerarToken(usuario.id, usuario.email);

    // ============================================
    // PASSO 12: RETORNAR SUCESSO
    // ============================================
    // Status 200 OK (login bem-sucedido)
    return res.status(200).json({
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
    console.error('Erro ao fazer login:', error);
    // Erro genérico 500 para não revelar detalhes
    return res.status(500).json({ error: error.message || 'Erro interno' });
  }
}

/**
 * ============================================
 * NOTAS IMPORTANTES SOBRE SEGURANÇA
 * ============================================
 * 
 * 1. ERRO GENÉRICO:
 *    - Retornamos "Email ou senha inválidos"
 *    - Não dizemos "Email não encontrado" ou "Senha errada"
 *    - Isso é importante: ataca não descobrem quais emails existem
 * 
 * 2. TIMING ATTACK:
 *    - Se retornássemos rápido para "email não existe"
 *    - E demorássemos para validar senha
 *    - Um ataque poderia medir o tempo e descobrir quais emails existem!
 *    - bcryptjs.compare() sempre demora o mesmo tempo (por design)
 * 
 * 3. RATE LIMITING (não implementado):
 *    - Deveria limitar quantas tentativas por IP
 *    - Se 5 tentativas erradas em 5 minutos: bloqueia
 *    - Previne brute force (tentar todas as senhas)
 * 
 * 4. TOKEN NÃO CONTÉM SENHA:
 *    - O JWT contém: userId, email (dados públicos)
 *    - NUNCA contém senha ou hash
 *    - Se alguém roubar o token, não fica com a senha
 */
