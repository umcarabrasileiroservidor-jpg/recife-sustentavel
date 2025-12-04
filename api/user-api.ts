import pool from './db';
import { autenticar } from './auth';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { type } = req.query;

  try {
    // 1. LIXEIRAS (Público)
    if (type === 'lixeiras') {
      const { rows } = await pool.query("SELECT * FROM pontos_coleta WHERE status = 'ativa'");
      const bins = rows.map((b: any) => ({
        id: b.id, location: b.nome_local, types: b.tipos_aceitos || ['Geral'],
        lat: b.latitude, lng: b.longitude, status: b.status
      }));
      return res.status(200).json(bins);
    }

    // 2. RECOMPENSAS (Público)
    if (type === 'recompensas') {
      const { rows } = await pool.query("SELECT * FROM recompensas WHERE ativo = true");
      const rewards = rows.map((r: any) => ({
        id: r.id, title: r.titulo, description: r.descricao, value: r.custo_pontos,
        partner: r.parceiro, type: 'voucher'
      }));
      return res.status(200).json(rewards);
    }

    // --- DAQUI PARA BAIXO PRECISA DE LOGIN ---
    const usuario = autenticar(req);
    if (!usuario) return res.status(401).json({ error: 'Não autorizado' });

    // 3. TRANSAÇÕES
    if (type === 'transacoes') {
      const { rows } = await pool.query("SELECT * FROM transacoes WHERE usuario_id = $1 ORDER BY criado_em DESC", [usuario.userId]);
      return res.status(200).json(rows);
    }

    // 4. HISTÓRICO
    if (type === 'historico') {
      const { rows } = await pool.query(`
        SELECT d.*, p.nome_local FROM descartes d
        LEFT JOIN pontos_coleta p ON d.ponto_coleta_id = p.id
        WHERE d.usuario_id = $1 ORDER BY d.criado_em DESC
      `, [usuario.userId]);
      return res.status(200).json(rows);
    }

    // 5. PENALIDADES
    if (type === 'penalidades') {
      const { rows } = await pool.query("SELECT * FROM penalidades WHERE usuario_id = $1 ORDER BY data_aplicacao DESC", [usuario.userId]);
      return res.status(200).json(rows);
    }

    return res.status(404).json({ error: 'Tipo inválido' });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}