import pool from './db';
import { autenticar } from './auth'; // Certifique-se que api/auth.ts existe

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const usuario = autenticar(req);
    if (!usuario) return res.status(401).json({ error: 'Não autorizado' });

    const { rows } = await pool.query(`
      SELECT d.*, p.nome_local 
      FROM descartes d
      LEFT JOIN pontos_coleta p ON d.ponto_coleta_id = p.id
      WHERE d.usuario_id = $1
      ORDER BY d.criado_em DESC
    `, [usuario.userId]);

    return res.status(200).json(rows);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}