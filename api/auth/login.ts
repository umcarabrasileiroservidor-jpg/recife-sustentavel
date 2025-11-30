import pool from '../db';
import { compararSenha, gerarToken } from '../auth';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let requestBody = req.body;
    if (typeof requestBody === 'string') {
      try { requestBody = JSON.parse(requestBody); } catch (e) { return res.status(400).json({ error: 'Body JSON inválido' }); }
    }

    const { email, senha } = requestBody || {};
    if (!email || !senha) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

    const result = await pool.query(
      `SELECT id, nome, email, senha_hash, cpf, telefone, saldo_pontos, nivel_usuario FROM usuarios WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) return res.status(401).json({ error: 'Email ou senha inválidos' });
    const usuario = result.rows[0];

    const senhaValida = await compararSenha(senha, usuario.senha_hash);
    if (!senhaValida) return res.status(401).json({ error: 'Email ou senha inválidos' });

    const token = gerarToken(usuario.id, usuario.email);
    return res.status(200).json({ success: true, token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, cpf: usuario.cpf, telefone: usuario.telefone, saldo_pontos: usuario.saldo_pontos, nivel_usuario: usuario.nivel_usuario } });
  } catch (error: any) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({ error: error.message || 'Erro interno' });
  }
}
