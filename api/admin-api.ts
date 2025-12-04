import pool from './db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { type, id } = req.query;
  const body = req.body;

  try {
    // DASHBOARD: Contagem Total (Removemos os filtros WHERE para mostrar o real total se preferir)
    if (type === 'dashboard') {
      const [users, bins, rewards, penalties, discards] = await Promise.all([
        pool.query("SELECT COUNT(*) FROM usuarios"), // Conta TODOS
        pool.query("SELECT COUNT(*) FROM pontos_coleta"), // Conta TODAS
        pool.query("SELECT COUNT(*) FROM recompensas"), // Conta TODAS
        pool.query("SELECT COUNT(*) FROM penalidades WHERE status = 'ativa'"),
        pool.query("SELECT COUNT(*) FROM descartes")
      ]);
      
      return res.status(200).json({
        stats: {
          activeUsers: parseInt(users.rows[0].count),
          activeBins: parseInt(bins.rows[0].count),
          activeRewards: parseInt(rewards.rows[0].count),
          activePenalties: parseInt(penalties.rows[0].count),
          totalDiscards: parseInt(discards.rows[0].count)
        },
        charts: [] // Simplificado
      });
    }

    // LIXEIRAS
    if (type === 'bins') {
      if (req.method === 'GET') {
        const { rows } = await pool.query("SELECT * FROM pontos_coleta ORDER BY criado_em DESC");
        // MAPEAMENTO CRÍTICO:
        return res.status(200).json(rows.map((b: any) => ({
          id: b.id, 
          location: b.nome_local,  // nome_local -> location
          type: b.tipos_aceitos?.[0] || 'geral',
          status: b.status, 
          lat: b.latitude,         // latitude -> lat (Frontend espera lat)
          lng: b.longitude,        // longitude -> lng
          capacity: b.capacidade_total || 100
        })));
      }
      if (req.method === 'POST') {
        await pool.query("INSERT INTO pontos_coleta (nome_local, latitude, longitude, tipos_aceitos, status) VALUES ($1, $2, $3, ARRAY[$4], 'ativa')", [body.location, body.lat, body.lng, body.type]);
        return res.json({success:true});
      }
      if (req.method === 'PUT') {
        await pool.query("UPDATE pontos_coleta SET nome_local=$1, latitude=$2, longitude=$3, tipos_aceitos=ARRAY[$4], status=$5 WHERE id=$6", [body.location, body.lat, body.lng, body.type, body.status, body.id]);
        return res.json({success:true});
      }
      if (req.method === 'DELETE') { await pool.query("DELETE FROM pontos_coleta WHERE id = $1", [id]); return res.json({success:true}); }
    }

    // RECOMPENSAS
    if (type === 'rewards') {
      if (req.method === 'GET') { 
        const { rows } = await pool.query("SELECT * FROM recompensas ORDER BY criado_em DESC"); 
        // MAPEAMENTO CRÍTICO:
        return res.json(rows.map((r:any) => ({
            id: r.id, 
            title: r.titulo,      // titulo -> title
            description: r.descricao, 
            value: r.custo_pontos, // custo_pontos -> value
            partner: r.parceiro, 
            status: r.ativo ? 'ativo' : 'inativo',
            type: r.tipo || 'voucher'
        }))); 
      }
      if (req.method === 'POST') { await pool.query("INSERT INTO recompensas (titulo, descricao, custo_pontos, parceiro, ativo, tipo) VALUES ($1, $2, $3, $4, true, $5)", [body.title, body.description, body.value, body.partner, body.type || 'voucher']); return res.json({success:true}); }
      if (req.method === 'PUT') { await pool.query("UPDATE recompensas SET titulo=$1, descricao=$2, custo_pontos=$3, parceiro=$4, ativo=$5 WHERE id=$6", [body.title, body.description, body.value, body.partner, body.status === 'ativo', body.id]); return res.json({success:true}); }
      if (req.method === 'DELETE') { await pool.query("DELETE FROM recompensas WHERE id = $1", [id]); return res.json({success:true}); }
    }

    // USUÁRIOS e OUTROS...
    // (O resto está igual ao anterior, pode manter ou copiar do meu envio passado)
    // ... (Auditoria, Penalties, Users...)
    if (type === 'users') {
        if (req.method === 'GET') {
          const { rows } = await pool.query("SELECT id, nome, email, saldo_pontos, nivel_usuario, status_conta FROM usuarios ORDER BY criado_em DESC");
          return res.status(200).json(rows.map((u: any) => ({ id: u.id, name: u.nome, email: u.email, capivaras: u.saldo_pontos, nivel: u.nivel_usuario, status: u.status_conta })));
        }
    }
    if (type === 'auditoria') {
        if (req.method === 'GET') { 
            const { rows } = await pool.query("SELECT d.*, u.nome as usuario_nome FROM descartes d JOIN usuarios u ON d.usuario_id = u.id WHERE d.status = 'pendente'"); 
            return res.json(rows); 
        }
    }

    return res.status(404).json({ error: 'Tipo não encontrado' });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}