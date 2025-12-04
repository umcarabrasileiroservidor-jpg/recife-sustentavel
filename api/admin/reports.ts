import pool from '../db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Dados reais dos últimos 7 dias
    const { rows: dailyData } = await pool.query(`
      SELECT to_char(criado_em, 'DD/MM') as day, COUNT(*) as descartes 
      FROM descartes 
      WHERE criado_em > NOW() - INTERVAL '7 days'
      GROUP BY day ORDER BY MAX(criado_em)
    `);

    // Dados de fluxo de capivaras (Ganhos vs Gastos)
    const { rows: flowData } = await pool.query(`
      SELECT tipo, SUM(ABS(valor)) as total 
      FROM transacoes 
      GROUP BY tipo
    `);

    return res.status(200).json({
      daily: dailyData,
      flow: flowData
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}