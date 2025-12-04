import pool from '../db';
import { hashSenha, gerarToken } from '../auth';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (typeof req.body === 'string') req.body = JSON.parse(req.body);
    const { nome, email, senha, cpf, telefone } = req.body;

    if (!nome || !email || !senha) return res.status(400).json({ error: 'Dados incompletos' });

    const senhaHash = await hashSenha(senha);

    // CORREÇÃO: Inserindo 'ativo' explicitamente no status_conta
    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, cpf, telefone, saldo_pontos, nivel_usuario, status_conta)
       VALUES ($1, $2, $3, $4, $5, 0, 'Iniciante', 'ativo')
       RETURNING id, nome, email, cpf, telefone, saldo_pontos, nivel_usuario, status_conta`,
      [nome, email, senhaHash, cpf || null, telefone || null]
    );

    const usuario = result.rows[0];
    const token = gerarToken(usuario.id, usuario.email);

    return res.status(201).json({ success: true, token, usuario });

  } catch (error: any) {
    console.error(error);
    if (error.code === '23505') return res.status(409).json({ error: 'Email ou CPF já cadastrado' });
    return res.status(500).json({ error: error.message });
  }
}