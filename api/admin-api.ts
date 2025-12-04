import pool from './db';

export default async function handler(req: any, res: any) {
  // CORS e Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // O segredo: usamos '?type=...' para saber o que fazer
  const { type, id, periodo } = req.query;
  const body = req.body;

  try {
    // --- DASHBOARD ---
    if (type === 'dashboard') {
      const [users, bins, rewards, penalties, discards] = await Promise.all([
        pool.query("SELECT COUNT(*) FROM usuarios WHERE status_conta = 'ativo'"),
        pool.query("SELECT COUNT(*) FROM pontos_coleta WHERE status = 'ativa'"),
        pool.query("SELECT COUNT(*) FROM recompensas WHERE ativo = true"),
        pool.query("SELECT COUNT(*) FROM penalidades WHERE status = 'ativa'"),
        pool.query("SELECT COUNT(*) FROM descartes")
      ]);
      
      let charts = [];
      try {
         const { rows } = await pool.query(`
            SELECT to_char(criado_em, 'DD/MM') as day, COUNT(*) as descartes 
            FROM descartes WHERE criado_em > NOW() - INTERVAL '7 days'
            GROUP BY day ORDER BY MAX(criado_em) ASC
         `);
         charts = rows;
      } catch(e) {}

      return res.status(200).json({
        stats: {
          activeUsers: parseInt(users.rows[0].count),
          activeBins: parseInt(bins.rows[0].count),
          activeRewards: parseInt(rewards.rows[0].count),
          activePenalties: parseInt(penalties.rows[0].count),
          totalDiscards: parseInt(discards.rows[0].count)
        },
        charts
      });
    }

    // --- USUÁRIOS ---
    if (type === 'users') {
      if (req.method === 'GET') {
        const { rows } = await pool.query(`
          SELECT id, nome, email, saldo_pontos, nivel_usuario, status_conta, 
                 to_char(criado_em, 'DD/MM/YYYY') as cadastro,
                 (SELECT COUNT(*) FROM descartes WHERE usuario_id = usuarios.id) as total_descartes
          FROM usuarios ORDER BY criado_em DESC
        `);
        return res.status(200).json(rows.map((u: any) => ({
          id: u.id, name: u.nome, email: u.email, capivaras: u.saldo_pontos,
          nivel: u.nivel_usuario, status: u.status_conta || 'ativo',
          descartes: u.total_descartes, cadastro: u.cadastro
        })));
      }
      if (req.method === 'PUT') {
        await pool.query("UPDATE usuarios SET status_conta = $1 WHERE id = $2", [body.status, body.id]);
        return res.status(200).json({ success: true });
      }
      if (req.method === 'DELETE') {
        await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
        return res.status(200).json({ success: true });
      }
    }

    // --- LIXEIRAS ---
    if (type === 'bins') {
      if (req.method === 'GET') {
        const { rows } = await pool.query("SELECT * FROM pontos_coleta ORDER BY criado_em DESC");
        return res.status(200).json(rows.map((b: any) => ({
          id: b.id, location: b.nome_local, type: b.tipos_aceitos?.[0] || 'geral',
          status: b.status, capacity: 100, lat: b.latitude, lng: b.longitude,
          lastValidation: new Date(b.criado_em).toLocaleDateString('pt-BR')
        })));
      }
      if (req.method === 'POST') {
        await pool.query(
          `INSERT INTO pontos_coleta (nome_local, latitude, longitude, tipos_aceitos, status)
           VALUES ($1, $2, $3, ARRAY[$4], 'ativa')`,
          [body.location, body.lat, body.lng, body.type]
        );
        return res.status(201).json({ success: true });
      }
      if (req.method === 'PUT') {
        await pool.query(
          `UPDATE pontos_coleta SET nome_local=$1, latitude=$2, longitude=$3, tipos_aceitos=ARRAY[$4], status=$5 WHERE id=$6`,
          [body.location, body.lat, body.lng, body.type, body.status, body.id]
        );
        return res.status(200).json({ success: true });
      }
      if (req.method === 'DELETE') {
        await pool.query("DELETE FROM pontos_coleta WHERE id = $1", [id]);
        return res.status(200).json({ success: true });
      }
    }

    // --- RECOMPENSAS ---
    if (type === 'rewards') {
      if (req.method === 'GET') {
        const { rows } = await pool.query("SELECT * FROM recompensas ORDER BY criado_em DESC");
        return res.status(200).json(rows.map((r: any) => ({
          id: r.id, title: r.titulo, description: r.descricao, value: r.custo_pontos,
          partner: r.parceiro, validity: 'Indefinida', type: 'voucher',
          status: r.ativo ? 'ativo' : 'inativo'
        })));
      }
      if (req.method === 'POST') {
        await pool.query(
          `INSERT INTO recompensas (titulo, descricao, custo_pontos, parceiro, ativo) VALUES ($1, $2, $3, $4, true)`,
          [body.title, body.description, body.value, body.partner]
        );
        return res.status(201).json({ success: true });
      }
      if (req.method === 'PUT') {
        await pool.query(
          `UPDATE recompensas SET titulo=$1, descricao=$2, custo_pontos=$3, parceiro=$4, ativo=$5 WHERE id=$6`,
          [body.title, body.description, body.value, body.partner, body.status === 'ativo', body.id]
        );
        return res.status(200).json({ success: true });
      }
      if (req.method === 'DELETE') {
        await pool.query("DELETE FROM recompensas WHERE id = $1", [id]);
        return res.status(200).json({ success: true });
      }
    }

    // --- PENALIDADES ---
    if (type === 'penalties') {
      if (req.method === 'GET') {
        const { rows } = await pool.query(`
          SELECT p.*, u.nome as user, u.email FROM penalidades p 
          JOIN usuarios u ON p.usuario_id = u.id ORDER BY p.data_aplicacao DESC
        `);
        return res.status(200).json(rows.map((p: any) => ({
          id: p.id, user: p.user, email: p.email, type: p.tipo, motivo: p.motivo,
          duracao: 0, aplicacao: new Date(p.data_aplicacao).toLocaleDateString('pt-BR'), status: p.status
        })));
      }
      if (req.method === 'POST') {
        await pool.query(
          `INSERT INTO penalidades (usuario_id, tipo, motivo, duracao_dias, status, data_aplicacao)
           VALUES ($1, $2, $3, $4, 'ativa', NOW())`,
          [body.usuario_id, body.tipo, body.motivo, body.duracao || 0]
        );
        return res.status(201).json({ success: true });
      }
      if (req.method === 'DELETE') {
        await pool.query("DELETE FROM penalidades WHERE id = $1", [id]);
        return res.status(200).json({ success: true });
      }
    }

    // --- AUDITORIA ---
    if (type === 'auditoria') {
      if (req.method === 'GET') {
        const { rows } = await pool.query(`
          SELECT d.*, u.nome as usuario_nome FROM descartes d
          JOIN usuarios u ON d.usuario_id = u.id WHERE d.status = 'pendente' ORDER BY d.criado_em ASC
        `);
        return res.status(200).json(rows);
      }
      if (req.method === 'POST') {
        const { status: novoStatus, pontos } = body;
        await pool.query('BEGIN');
        const { rows } = await pool.query(
          `UPDATE descartes SET status = $1, pontos_ganhos = $2, data_analise = NOW() 
           WHERE id = $3 RETURNING usuario_id, tipo_residuo`,
          [novoStatus, pontos, body.id]
        );
        if (rows.length > 0 && novoStatus === 'aprovado' && pontos > 0) {
          await pool.query(
            'UPDATE usuarios SET saldo_pontos = saldo_pontos + $1 WHERE id = $2',
            [pontos, rows[0].usuario_id]
          );
          await pool.query(
            `INSERT INTO transacoes (usuario_id, tipo, descricao, valor, criado_em) VALUES ($1, 'ganho', $2, $3, NOW())`,
            [rows[0].usuario_id, `Descarte Aprovado: ${rows[0].tipo_residuo}`, pontos]
          );
        }
        await pool.query('COMMIT');
        return res.status(200).json({ success: true });
      }
    }
    
    // --- RELATÓRIOS ---
    if (type === 'reports') {
      const { rows: daily } = await pool.query(`
        SELECT to_char(criado_em, 'DD/MM') as day, COUNT(*) as descartes 
        FROM descartes GROUP BY day ORDER BY MAX(criado_em) DESC LIMIT 7
      `);
      const { rows: flow } = await pool.query(`SELECT tipo, SUM(ABS(valor)) as total FROM transacoes GROUP BY tipo`);
      return res.status(200).json({ daily, flow });
    }

    return res.status(404).json({ error: 'Tipo não encontrado' });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}