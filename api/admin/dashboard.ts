import pool from '../db'; // Caminho correto para api/db.ts

export default async function handler(req: any, res: any) {
  // Headers para evitar erro de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 1. Buscas no Banco (Contagens Reais)
    const [usersRes, binsRes, rewardsRes, penaltiesRes] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM usuarios WHERE status_conta = 'ativo'"),
      pool.query("SELECT COUNT(*) FROM pontos_coleta WHERE status = 'ativa'"),
      pool.query("SELECT COUNT(*) FROM recompensas WHERE ativo = true"),
      pool.query("SELECT COUNT(*) FROM penalidades WHERE status = 'ativa'")
    ]);

    // 2. Busca dados para o gráfico (Opcional, se falhar não quebra o resto)
    let charts = [];
    try {
        const { rows } = await pool.query(`
            SELECT to_char(criado_em, 'DD/MM') as day, COUNT(*) as descartes 
            FROM descartes 
            WHERE criado_em > NOW() - INTERVAL '7 days'
            GROUP BY day
            ORDER BY MAX(criado_em) ASC
        `);
        charts = rows;
    } catch (e) {
        // Se não tiver tabela de descartes ainda, manda vazio
        charts = [];
    }

    // 3. Monta o objeto EXATAMENTE como o Dashboard.tsx espera
    const stats = {
      activeUsers: parseInt(usersRes.rows[0].count),     // Nome corrigido: activeUsers
      activeBins: parseInt(binsRes.rows[0].count),       // Nome corrigido: activeBins
      activeRewards: parseInt(rewardsRes.rows[0].count), // Nome corrigido: activeRewards
      activePenalties: parseInt(penaltiesRes.rows[0].count) // Nome corrigido: activePenalties
    };

    return res.status(200).json({ stats, charts });

  } catch (error: any) {
    console.error("Erro no Dashboard:", error);
    // Em caso de erro fatal, retorna zeros para a tela não ficar branca
    return res.status(200).json({
        stats: { activeUsers: 0, activeBins: 0, activeRewards: 0, activePenalties: 0 },
        charts: []
    });
  }
}