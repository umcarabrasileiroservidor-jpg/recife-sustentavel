import pool from '../src/lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { nome, email, senha, cpf, telefone } = req.body || {};
  if (!nome || !email || !senha) return res.status(400).json({ error: 'nome, email e senha são obrigatórios' });

  try {
    const hashed = await bcrypt.hash(senha, 10);
    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, cpf, telefone, saldo_pontos)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, nome, email, cpf, telefone, saldo_pontos`,
      [nome, email, hashed, cpf || null, telefone || null, 0]
    );

    const user = result.rows[0];
    return res.status(201).json({ user });
  } catch (err) {
    console.error('signup error', err);
    return res.status(500).json({ error: 'Erro interno ao criar usuário' });
  }
}
