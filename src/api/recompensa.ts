import pool from '../lib/db';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const client = await pool.connect();
  try {
    const { userId, cost, title } = req.body;

    await client.query('BEGIN');

    // Bloqueia a linha do usuário para concorrência
    const select = await client.query('SELECT saldo_pontos FROM usuarios WHERE id = $1 FOR UPDATE', [userId]);
    const usuario = select.rows[0];

    if (!usuario || usuario.saldo_pontos < cost) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    // Atualiza saldo
    await client.query('UPDATE usuarios SET saldo_pontos = saldo_pontos - $1 WHERE id = $2', [cost, userId]);

    // Registra transação
    await client.query(
      'INSERT INTO transacoes (usuario_id, tipo, descricao, valor) VALUES ($1, $2, $3, $4)',
      [userId, 'resgate', `Resgate: ${title}`, -Math.abs(cost)]
    );

    await client.query('COMMIT');

    return res.status(200).json({ success: true });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error(error);
    return res.status(500).json({ error: error.message || error });
  } finally {
    client.release();
  }
}