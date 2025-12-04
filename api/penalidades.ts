import pool from './db';
import { autenticar } from './auth';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const usuario = autenticar(req);
    if (!usuario) return res.status(401).json({ error: 'Não autorizado' });

    const { rows } = await pool.query(`
      SELECT id, tipo, motivo, status, data_aplicacao, data_expiracao
      FROM penalidades
      WHERE usuario_id = $1
      ORDER BY data_aplicacao DESC
    `, [usuario.userId]);

    return res.status(200).json(rows);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}