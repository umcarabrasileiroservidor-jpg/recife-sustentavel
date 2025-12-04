import pool from './db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { rows } = await pool.query("SELECT * FROM recompensas WHERE ativo = true");
    
    const rewards = rows.map((r: any) => ({
      id: r.id,
      title: r.titulo,
      description: r.descricao,
      value: r.custo_pontos,
      partner: r.parceiro,
      type: 'voucher' // Padrão
    }));

    return res.status(200).json(rewards);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}