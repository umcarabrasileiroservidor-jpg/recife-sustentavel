import pool from '../db';
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET: Listar Pendentes
  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query(`
        SELECT d.*, u.nome as usuario_nome, u.email as usuario_email
        FROM descartes d
        JOIN usuarios u ON d.usuario_id = u.id
        WHERE d.status = 'pendente'
        ORDER BY d.criado_em ASC
      `);
      return res.status(200).json(rows);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  // POST: Aprovar ou Rejeitar
  if (req.method === 'POST') {
    const { id, status, pontos } = req.body; // status: 'aprovado' | 'rejeitado'

    try {
      await pool.query('BEGIN');

      // 1. Atualiza o status do descarte
      const { rows } = await pool.query(
        `UPDATE descartes 
         SET status = $1, pontos_ganhos = $2, data_analise = NOW() 
         WHERE id = $3 RETURNING usuario_id, tipo_residuo`,
        [status, pontos, id]
      );
      
      if (rows.length === 0) throw new Error('Descarte não encontrado');
      const descarte = rows[0];

      // 2. Se APROVADO, dá os pontos e cria transação
      if (status === 'aprovado' && pontos > 0) {
        // Atualiza saldo
        await pool.query(
          'UPDATE usuarios SET saldo_pontos = saldo_pontos + $1 WHERE id = $2',
          [pontos, descarte.usuario_id]
        );
        
        // Cria extrato
        await pool.query(
          `INSERT INTO transacoes (usuario_id, tipo, descricao, valor, criado_em)
           VALUES ($1, 'ganho', $2, $3, NOW())`,
          [descarte.usuario_id, `Descarte Aprovado: ${descarte.tipo_residuo}`, pontos]
        );
      }

      await pool.query('COMMIT');
      return res.status(200).json({ success: true });

    } catch (e: any) {
      await pool.query('ROLLBACK');
      return res.status(500).json({ error: e.message });
    }
  }
}