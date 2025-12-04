import pool from '../db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // LISTAR
    if (req.method === 'GET') {
      const { rows } = await pool.query("SELECT * FROM recompensas ORDER BY criado_em DESC");
      const rewards = rows.map((r: any) => ({
        id: r.id,
        title: r.titulo,
        description: r.descricao,
        value: r.custo_pontos,
        partner: r.parceiro,
        validity: 'Indefinida',
        type: 'voucher',
        status: r.ativo ? 'ativo' : 'inativo'
      }));
      return res.status(200).json(rewards);
    }

    // CRIAR
    if (req.method === 'POST') {
      const { title, description, value, partner, type } = req.body;
      await pool.query(
        `INSERT INTO recompensas (titulo, descricao, custo_pontos, parceiro, ativo)
         VALUES ($1, $2, $3, $4, true)`,
        [title, description, value, partner]
      );
      return res.status(201).json({ success: true });
    }

    // ATUALIZAR
    if (req.method === 'PUT') {
      const { id, title, description, value, partner, status } = req.body;
      await pool.query(
        `UPDATE recompensas 
         SET titulo = $1, descricao = $2, custo_pontos = $3, parceiro = $4, ativo = $5 
         WHERE id = $6`,
        [title, description, value, partner, status === 'ativo', id]
      );
      return res.status(200).json({ success: true });
    }

    // EXCLUIR
    if (req.method === 'DELETE') {
      const id = req.query.id || req.body.id;
      await pool.query("DELETE FROM recompensas WHERE id = $1", [id]);
      return res.status(200).json({ success: true });
    }

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}