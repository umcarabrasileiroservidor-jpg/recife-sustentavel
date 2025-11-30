import pool from './db';
import { compararSenha, gerarToken } from './auth';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let requestBody = req.body;
  if (typeof requestBody === 'string') {
    try { requestBody = JSON.parse(requestBody); } catch (e) { return res.status(400).json({ error: 'Body JSON inválido' }); }
  }
  const { email, senha } = requestBody || {};
  if (!email || !senha) return res.status(400).json({ error: 'email e senha são obrigatórios' });

  try {
    const result = await pool.query('SELECT id, nome, email, senha_hash, cpf, telefone, saldo_pontos FROM usuarios WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const ok = await compararSenha(senha, user.senha_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = gerarToken(user.id, user.email);

    // Remover senha_hash antes de retornar
    delete user.senha_hash;

    return res.status(200).json({ token, user });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ error: 'Erro interno ao autenticar' });
  }
}
