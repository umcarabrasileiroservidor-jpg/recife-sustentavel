import pool from './db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { type, id, periodo } = req.query;
  const body = req.body;

  try {
    // DASHBOARD
    if (type === 'dashboard') {
      const [u, b, r, p] = await Promise.all([
        pool.query("SELECT COUNT(*) FROM usuarios WHERE status_conta = 'ativo'"),
        pool.query("SELECT COUNT(*) FROM pontos_coleta WHERE status = 'ativa'"),
        pool.query("SELECT COUNT(*) FROM recompensas WHERE ativo = true"),
        pool.query("SELECT COUNT(*) FROM penalidades WHERE status = 'ativa'")
      ]);
      
      // Gráfico simples
      let charts = [];
      try {
          const { rows } = await pool.query(`SELECT to_char(criado_em, 'DD/MM') as day, COUNT(*) as descartes FROM descartes WHERE criado_em > NOW() - INTERVAL '7 days' GROUP BY day`);
          charts = rows;
      } catch(e) {}

      return res.status(200).json({
        stats: { activeUsers: u.rows[0].count, activeBins: b.rows[0].count, activeRewards: r.rows[0].count, activePenalties: p.rows[0].count },
        charts
      });
    }

    // USERS
    if (type === 'users') {
      if (req.method === 'GET') {
        const { rows } = await pool.query("SELECT id, nome, email, saldo_pontos, nivel_usuario, status_conta FROM usuarios ORDER BY criado_em DESC");
        return res.status(200).json(rows);
      }
      if (req.method === 'PUT') { await pool.query("UPDATE usuarios SET status_conta = $1 WHERE id = $2", [body.status, body.id]); return res.json({success:true}); }
      if (req.method === 'DELETE') { await pool.query("DELETE FROM usuarios WHERE id = $1", [id]); return res.json({success:true}); }
    }

    // BINS
    if (type === 'bins') {
      if (req.method === 'GET') {
        const { rows } = await pool.query("SELECT * FROM pontos_coleta ORDER BY criado_em DESC");
        return res.status(200).json(rows.map((b: any) => ({ ...b, location: b.nome_local, type: b.tipos_aceitos?.[0] || 'geral', capacity: 100 })));
      }
      if (req.method === 'POST') { await pool.query("INSERT INTO pontos_coleta (nome_local, latitude, longitude, tipos_aceitos, status) VALUES ($1, $2, $3, ARRAY[$4], 'ativa')", [body.location, body.lat, body.lng, body.type]); return res.json({success:true}); }
      if (req.method === 'DELETE') { await pool.query("DELETE FROM pontos_coleta WHERE id = $1", [id]); return res.json({success:true}); }
    }

    // REWARDS
    if (type === 'rewards') {
      if (req.method === 'GET') { const { rows } = await pool.query("SELECT * FROM recompensas"); return res.json(rows); }
      if (req.method === 'POST') { await pool.query("INSERT INTO recompensas (titulo, descricao, custo_pontos, parceiro, ativo) VALUES ($1, $2, $3, $4, true)", [body.title, body.description, body.value, body.partner]); return res.json({success:true}); }
      if (req.method === 'DELETE') { await pool.query("DELETE FROM recompensas WHERE id = $1", [id]); return res.json({success:true}); }
    }

    // PENALTIES
    if (type === 'penalties') {
      if (req.method === 'GET') { const { rows } = await pool.query("SELECT p.*, u.nome as user, u.email FROM penalidades p JOIN usuarios u ON p.usuario_id = u.id"); return res.json(rows); }
      if (req.method === 'POST') { await pool.query("INSERT INTO penalidades (usuario_id, tipo, motivo, duracao_dias, status, data_aplicacao) VALUES ($1, $2, $3, $4, 'ativa', NOW())", [body.usuario_id, body.tipo, body.motivo, body.duracao]); return res.json({success:true}); }
      if (req.method === 'DELETE') { await pool.query("DELETE FROM penalidades WHERE id = $1", [id]); return res.json({success:true}); }
    }

    // AUDITORIA
    if (type === 'auditoria') {
      if (req.method === 'GET') { const { rows } = await pool.query("SELECT d.*, u.nome as usuario_nome FROM descartes d JOIN usuarios u ON d.usuario_id = u.id WHERE d.status = 'pendente'"); return res.json(rows); }
      if (req.method === 'POST') {
         await pool.query("UPDATE descartes SET status = $1, pontos_ganhos = $2 WHERE id = $3", [body.status, body.pontos, body.id]);
         if (body.status === 'aprovado') await pool.query("UPDATE usuarios SET saldo_pontos = saldo_pontos + $1 WHERE id = (SELECT usuario_id FROM descartes WHERE id = $2)", [body.pontos, body.id]);
         return res.json({success:true});
      }
    }

    return res.status(404).json({ error: 'Tipo não encontrado' });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}