import pool from './db';

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { rows } = await pool.query("SELECT * FROM pontos_coleta WHERE status = 'ativa'");
    
    // Formata para o frontend
    const bins = rows.map((b: any) => ({
      id: b.id,
      location: b.nome_local,
      types: b.tipos_aceitos || ['Geral'],
      lat: b.latitude,
      lng: b.longitude,
      status: b.status
    }));

    return res.status(200).json(bins);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}