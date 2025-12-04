import pool from '../db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // LISTAR
    if (req.method === 'GET') {
      const { rows } = await pool.query("SELECT * FROM pontos_coleta ORDER BY criado_em DESC");
      const bins = rows.map((b: any) => ({
        id: b.id,
        location: b.nome_local,
        type: b.tipos_aceitos?.[0] || 'geral',
        status: b.status,
        capacity: b.capacidade_total || 100,
        lat: b.latitude,
        lng: b.longitude,
        lastValidation: new Date(b.criado_em).toLocaleDateString('pt-BR')
      }));
      return res.status(200).json(bins);
    }

    // CRIAR
    if (req.method === 'POST') {
      const { location, lat, lng, type, capacity } = req.body;
      await pool.query(
        `INSERT INTO pontos_coleta (nome_local, latitude, longitude, tipos_aceitos, capacidade_total, status)
         VALUES ($1, $2, $3, ARRAY[$4], $5, 'ativa')`,
        [location, lat, lng, type, capacity || 100]
      );
      return res.status(201).json({ success: true });
    }

    // ATUALIZAR
    if (req.method === 'PUT') {
      const { id, location, lat, lng, type, status } = req.body;
      await pool.query(
        `UPDATE pontos_coleta 
         SET nome_local = $1, latitude = $2, longitude = $3, tipos_aceitos = ARRAY[$4], status = $5 
         WHERE id = $6`,
        [location, lat, lng, type, status, id]
      );
      return res.status(200).json({ success: true });
    }

   // EXCLUIR
    if (req.method === 'DELETE') {
      const id = req.query.id || req.body.id;
      await pool.query("DELETE FROM pontos_coleta WHERE id = $1", [id]);
      return res.status(200).json({ success: true });
    }

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}