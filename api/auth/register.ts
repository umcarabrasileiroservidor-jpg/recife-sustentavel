import pool from '../db';
import { hashSenha, gerarToken } from '../auth';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (typeof req.body === 'string') {
      try { req.body = JSON.parse(req.body); } catch (e) { return res.status(400).json({ error: 'Corpo da requisição inválido' }); }
    }

    const { nome, email, senha, cpf, telefone } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });

    const senhaHash = await hashSenha(senha);

    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, cpf, telefone, saldo_pontos, nivel_usuario)
       VALUES ($1, $2, $3, $4, $5, 50, 'Iniciante')
       RETURNING id, nome, email, cpf, telefone, saldo_pontos, nivel_usuario`,
      [nome, email, senhaHash, cpf || null, telefone || null]
    );

    const usuario = result.rows[0];
    const token = gerarToken(usuario.id, usuario.email);

    return res.status(201).json({ success: true, token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, cpf: usuario.cpf, telefone: usuario.telefone, saldo_pontos: usuario.saldo_pontos, nivel_usuario: usuario.nivel_usuario } });
  } catch (error: any) {
    console.error('Erro ao registrar:', error);
    if (error.code === '23505') return res.status(409).json({ error: 'Email já cadastrado' });
    return res.status(500).json({ error: error.message || 'Erro interno ao registrar usuário' });
  }
}
