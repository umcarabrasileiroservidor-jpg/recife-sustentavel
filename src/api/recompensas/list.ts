import pool from '../../lib/db';
import { autenticar } from '../../lib/auth';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const result = await pool.query(
        `SELECT id, titulo, descricao, custo_pontos, parceiro, imagem_url, ativo
         FROM recompensas WHERE ativo = true
         ORDER BY criado_em DESC`
      );

      return res.status(200).json({ recompensas: result.rows });
    } catch (error: any) {
      console.error('Erro ao listar recompensas:', error);
      return res.status(500).json({ error: error.message || 'Erro interno' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
