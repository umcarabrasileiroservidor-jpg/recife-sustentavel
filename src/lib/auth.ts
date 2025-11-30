/**
 * ============================================
 * ARQUIVO: src/lib/auth.ts
 * DESCRIÇÃO: Autenticação com JWT (JSON Web Tokens) e Criptografia de Senha
 * ============================================
 * 
 * Este arquivo centraliza TODA a lógica de segurança:
 * 1. Geração de tokens JWT (stateless authentication)
 * 2. Verificação de tokens
 * 3. Hash de senhas com bcrypt
 * 4. Comparação de senhas
 * 
 * ⚠️ POR QUE JWT?
 * - Em APIs REST sem sessão, JWT é o padrão
 * - O token é enviado no header Authorization: Bearer <token>
 * - O servidor não precisa guardar sessões (stateless)
 * - Escalável e funciona bem em Serverless
 */

import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import type { SignOptions } from 'jsonwebtoken';

/**
 * JWT_SECRET
 * Chave secreta usada para ASSINAR e VERIFICAR tokens JWT.
 * Deve estar em .env.local como JWT_SECRET=sua_chave_super_secreta
 * 
 * ⚠️ NUNCA comita esta chave no GitHub!
 * ⚠️ Em produção, deve ser gerado randomicamente (ex: 256 bits de entropia)
 */
const JWT_SECRET = process.env.JWT_SECRET || "segredo-super-secreto-do-projeto-recife-2025";

/**
 * INTERFACE: TokenPayload
 * Define a ESTRUTURA dos dados guardados dentro do JWT
 * Quando alguém decodifica o token, estes são os dados que recebe:
 * - userId: ID do usuário (para saber quem é)
 * - email: Email (para referência)
 * - iat: issued at (timestamp de quando foi criado)
 * - exp: expiration (timestamp de quando expira)
 */
export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;  // issued at (quando foi criado)
  exp?: number;  // expiration (quando expira)
}

/**
 * ============================================
 * FUNÇÃO 1: gerarToken()
 * ============================================
 * 
 * O QUE FAZ:
 * - Cria um JWT assinado com a chave secreta
 * - O token expira em 7 dias por padrão
 * 
 * PARÂMETROS:
 * - userId: ID do usuário (string UUID)
 * - email: Email do usuário
 * - expiresIn: Quanto tempo o token dura (padrão: '7d')
 * 
 * RETORNA:
 * - Uma string com o token JWT codificado
 * 
 * EXEMPLO:
 * const token = gerarToken('123-uuid', 'joao@email.com');
 * // token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2..."
 * 
 * FLUXO:
 * 1. Prepara as opções (tempo de expiração)
 * 2. Assina os dados (userId, email) com a chave secreta
 * 3. Retorna o token codificado
 */
export function gerarToken(userId: string, email: string, expiresIn: string | number = '7d'): string {
  const options: SignOptions = { expiresIn: expiresIn as SignOptions['expiresIn'] };
  // jwt.sign() cria um novo token assinado com a chave secreta
  return jwt.sign({ userId, email }, JWT_SECRET as string, options);
}

/**
 * ============================================
 * FUNÇÃO 2: verificarToken()
 * ============================================
 * 
 * O QUE FAZ:
 * - Recebe um token JWT
 * - Valida a assinatura (verifica se foi assinado com a chave correta)
 * - Valida o tempo de expiração
 * - Retorna os dados dentro do token se for válido
 * 
 * PARÂMETROS:
 * - token: String JWT para verificar
 * 
 * RETORNA:
 * - TokenPayload (userId, email, iat, exp) se válido
 * - null se inválido ou expirado
 * 
 * EXEMPLO:
 * const payload = verificarToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 * if (payload) {
 *   console.log(payload.userId); // ID do usuário
 * } else {
 *   console.log('Token inválido ou expirado');
 * }
 * 
 * FLUXO:
 * 1. Tenta verificar o token com a chave secreta
 * 2. Se der erro (token inválido/expirado), retorna null
 * 3. Se der certo, retorna os dados decodificados
 */
export function verificarToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as TokenPayload;
    return decoded;
  } catch (error) {
    // Token inválido, expirado, ou assinado com chave errada
    return null;
  }
}

/**
 * ============================================
 * FUNÇÃO 3: extrairTokenDoHeader()
 * ============================================
 * 
 * O QUE FAZ:
 * - Recebe o header HTTP "Authorization"
 * - Extrai o token do formato: "Bearer <token>"
 * 
 * PARÂMETROS:
 * - authHeader: O valor do header Authorization (ex: "Bearer eyJhbGc...")
 * 
 * RETORNA:
 * - A string do token se encontrar no formato correto
 * - null se não encontrar ou formato inválido
 * 
 * EXEMPLO:
 * const header = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
 * const token = extrairTokenDoHeader(header);
 * // token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * 
 * FLUXO:
 * 1. Verifica se header existe e começa com "Bearer "
 * 2. Se não: retorna null
 * 3. Se sim: remove os primeiros 7 caracteres ("Bearer ") e retorna o resto
 */
export function extrairTokenDoHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  // Remove os 7 primeiros caracteres ("Bearer ") deixando só o token
  return authHeader.slice(7);
}

/**
 * ============================================
 * FUNÇÃO 4: hashSenha()
 * ============================================
 * 
 * O QUE FAZ:
 * - Recebe uma senha em TEXTO PLANO
 * - Gera um HASH criptografado dela com bcryptjs
 * - Nunca armazena senha em texto plano no banco!
 * 
 * PARÂMETROS:
 * - senha: String com a senha do usuário
 * 
 * RETORNA:
 * - Promise<string> com o hash criptografado
 * 
 * EXEMPLO:
 * const hash = await hashSenha('minhasenha123');
 * // hash = "$2a$10$JV8I7H5dZ.fG9e7K3m2L1OmN5p4O3qRs2T1UvWxYz..."
 * 
 * FLUXO:
 * 1. bcryptjs.hash() recebe a senha e "rounds" (10)
 * 2. Rounds = quantas vezes embaralha (mais rounds = mais seguro + lento)
 * 3. Retorna um hash único que é impossível reverter
 * 
 * ⚠️ IMPORTANTE:
 * Nunca comparar hashes com ===
 * Usar a função compararSenha() ao invés!
 */
export async function hashSenha(senha: string): Promise<string> {
  return bcryptjs.hash(senha, 10); // 10 é o número de "rounds"
}

/**
 * ============================================
 * FUNÇÃO 5: compararSenha()
 * ============================================
 * 
 * O QUE FAZ:
 * - Compara uma senha em TEXTO PLANO com um HASH
 * - Retorna true se forem iguais, false caso contrário
 * - Usada no LOGIN para validar a senha
 * 
 * PARÂMETROS:
 * - senha: Texto plano digitado pelo usuário
 * - hash: Hash armazenado no banco de dados
 * 
 * RETORNA:
 * - Promise<boolean> (true = correto, false = errado)
 * 
 * EXEMPLO:
 * const senhaCorreta = await compararSenha('minhasenha123', hashDoBanco);
 * if (senhaCorreta) {
 *   console.log('Login bem-sucedido!');
 * } else {
 *   console.log('Senha incorreta!');
 * }
 * 
 * FLUXO:
 * 1. bcryptjs.compare() recebe a senha e o hash
 * 2. Faz o hash da senha e compara com o hash armazenado
 * 3. Se forem iguais, retorna true
 */
export async function compararSenha(senha: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(senha, hash);
}

/**
 * ============================================
 * FUNÇÃO 6: autenticar()
 * ============================================
 * 
 * O QUE FAZ:
 * - É um MIDDLEWARE para proteger rotas
 * - Extrai o token do header Authorization
 * - Verifica se o token é válido
 * - Retorna os dados do token se válido
 * 
 * PARÂMETROS:
 * - req: Objeto da requisição HTTP (contém headers)
 * 
 * RETORNA:
 * - TokenPayload se autenticado com sucesso
 * - null se não autenticado
 * 
 * EXEMPLO DE USO EM UM ENDPOINT:
 * export default async function handler(req, res) {
 *   const payload = autenticar(req);
 *   if (!payload) {
 *     return res.status(401).json({ error: 'Não autorizado' });
 *   }
 *   // Agora temos acesso a payload.userId
 *   console.log('Usuário autenticado:', payload.userId);
 * }
 * 
 * FLUXO:
 * 1. Tenta extrair o header Authorization
 * 2. Extrai o token do formato "Bearer <token>"
 * 3. Se não encontrar token: retorna null
 * 4. Se encontrar: verifica o token
 * 5. Retorna os dados se válido, null se inválido
 */
export function autenticar(req: any): TokenPayload | null {
  // Alguns clientes enviam lowercase 'authorization', outros 'Authorization'
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = extrairTokenDoHeader(authHeader);

  if (!token) {
    return null;
  }

  return verificarToken(token);
}
