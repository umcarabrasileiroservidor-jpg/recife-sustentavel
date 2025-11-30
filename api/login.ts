import pool from '../src/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, senha } = req.body || {};
  if (!email || !senha) return res.status(400).json({ error: 'email e senha são obrigatórios' });

  try {
    const result = await pool.query('SELECT id, nome, email, senha_hash, cpf, telefone, saldo_pontos FROM usuarios WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const ok = await bcrypt.compare(senha, user.senha_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Remover senha_hash antes de retornar
    delete user.senha_hash;

    return res.status(200).json({ token, user });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ error: 'Erro interno ao autenticar' });
  }
}
