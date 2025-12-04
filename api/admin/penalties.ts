import pool from '../db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // LISTAR
    if (req.method === 'GET') {
      const { rows } = await pool.query(`
        SELECT p.*, u.nome as user, u.email 
        FROM penalidades p 
        JOIN usuarios u ON p.usuario_id = u.id 
        ORDER BY p.data_aplicacao DESC
      `);
      return res.status(200).json(rows);
    }

    // CRIAR (NOVO!)
    if (req.method === 'POST') {
      const { usuario_id, tipo, motivo, duracao } = req.body;
      await pool.query(
        `INSERT INTO penalidades (usuario_id, tipo, motivo, duracao_dias, status, data_aplicacao)
         VALUES ($1, $2, $3, $4, 'ativa', NOW())`,
        [usuario_id, tipo, motivo, duracao || 0]
      );
      return res.status(201).json({ success: true });
    }

    // REVOGAR (DELETE)
    if (req.method === 'DELETE') {
       const { id } = req.query;
       await pool.query("DELETE FROM penalidades WHERE id = $1", [id]);
       return res.status(200).json({ success: true });
    }

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}