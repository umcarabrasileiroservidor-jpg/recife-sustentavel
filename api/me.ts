import pool from './db';
import { verificarToken, extrairTokenDoHeader } from './auth';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authHeader = req.headers?.authorization || '';
    const token = extrairTokenDoHeader(authHeader);
    if (!token) return res.status(401).json({ error: 'Token ausente' });

    const payload = verificarToken(token);
    if (!payload) return res.status(401).json({ error: 'Token inválido' });
    const userId = payload.userId;

    const result = await pool.query('SELECT id, nome, email, cpf, telefone, saldo_pontos FROM usuarios WHERE id = $1', [userId]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    return res.status(200).json({ user });
  } catch (err) {
    console.error('me error', err);
    return res.status(500).json({ error: 'Erro interno ao obter perfil' });
  }
}
