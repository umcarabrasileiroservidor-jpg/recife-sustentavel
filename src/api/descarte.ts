import pool from '../lib/db';
import { autenticar } from '../lib/auth';

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('\n🗑️ [DESCARTE] Iniciando registro de descarte...');

  const payload = autenticar(req);
  if (!payload) {
    console.error('❌ [DESCARTE] Usuário não autenticado');
    return res.status(401).json({ error: 'Não autenticado' });
  }

  console.log('✅ [DESCARTE] Usuário autenticado:', { userId: payload.userId });

  const client = await pool.connect();
  try {
    const { tipo_residuo, multiplicador_volume, pontos_base = 10 } = req.body;

    console.log('📝 [DESCARTE] Dados recebidos:', { tipo_residuo, multiplicador_volume, pontos_base });

    if (!tipo_residuo) {
      console.error('❌ [DESCARTE] Tipo de resíduo faltando');
      return res.status(400).json({ error: 'tipo_residuo é obrigatório' });
    }

    const pontos_ganhos = Math.round(pontos_base * (multiplicador_volume || 1));
    console.log('⭐ [DESCARTE] Pontos calculados:', pontos_ganhos);

    await client.query('BEGIN');

    // Insere descarte
    const descarteResult = await client.query(
      `INSERT INTO descartes (usuario_id, tipo_residuo, multiplicador_volume, pontos_ganhos, validado_ia)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, pontos_ganhos`,
      [payload.userId, tipo_residuo, multiplicador_volume || 1, pontos_ganhos]
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

    console.log('✅ [DESCARTE] Descarte registrado com sucesso!', { descarte_id: descarte.id, points: descarte.pontos_ganhos });

    return res.status(200).json({
      success: true,
      descarte_id: descarte.id,
      points: descarte.pontos_ganhos,
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('❌ [DESCARTE] ERRO FATAL:', error.message);
    console.error('🔍 [DESCARTE] Stack:', error.stack);
    return res.status(500).json({ error: error.message || 'Erro interno' });
  } finally {
    client.release();
  }
}
