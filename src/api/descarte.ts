import pool from '../lib/db';
import { autenticar } from '../lib/auth';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = autenticar(req);
  if (!payload) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  const client = await pool.connect();
  try {
    const { tipo_residuo, multiplicador, pontos_base = 10 } = req.body;

    if (!tipo_residuo) {
      return res.status(400).json({ error: 'tipo_residuo é obrigatório' });
    }

    const pontos_ganhos = Math.round(pontos_base * (multiplicador || 1));

    await client.query('BEGIN');

    // Insere descarte
    const descarteResult = await client.query(
      `INSERT INTO descartes (usuario_id, tipo_residuo, multiplicador_volume, pontos_ganhos, validado_ia)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, pontos_ganhos`,
      [payload.userId, tipo_residuo, multiplicador || 1, pontos_ganhos]
    );

    const descarte = descarteResult.rows[0];

    // Atualiza saldo do usuário
    await client.query(
      'UPDATE usuarios SET saldo_pontos = saldo_pontos + $1 WHERE id = $2',
      [descarte.pontos_ganhos, payload.userId]
    );

    // Cria transação
    await client.query(
      `INSERT INTO transacoes (usuario_id, tipo, descricao, valor)
       VALUES ($1, 'ganho', $2, $3)`,
      [payload.userId, `Descarte de ${tipo_residuo}`, descarte.pontos_ganhos]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      descarte_id: descarte.id,
      points: descarte.pontos_ganhos,
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Erro ao registrar descarte:', error);
    return res.status(500).json({ error: error.message || 'Erro interno' });
  } finally {
    client.release();
  }
}
