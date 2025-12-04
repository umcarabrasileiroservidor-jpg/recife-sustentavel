import pool from './db';
import { autenticar } from './auth';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const usuario = autenticar(req);
    if (!usuario) return res.status(401).json({ error: 'Não autorizado' });

    // Busca descartes e tenta juntar com o nome da lixeira (se houver)
    const { rows } = await pool.query(`
      SELECT d.id, d.tipo_residuo, d.pontos_ganhos, d.criado_em, d.validado_ia, 
             p.nome_local as localizacao
      FROM descartes d
      LEFT JOIN pontos_coleta p ON d.ponto_coleta_id = p.id
      WHERE d.usuario_id = $1 
      ORDER BY d.criado_em DESC
    `, [usuario.userId]);

    return res.status(200).json(rows);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}