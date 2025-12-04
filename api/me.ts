import pool from './db';
import { verificarToken, extrairTokenDoHeader } from './auth';

export default async function handler(req: any, res: any) {
  // Headers de segurança e CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authHeader = req.headers?.authorization || '';
    const token = extrairTokenDoHeader(authHeader);
    
    if (!token) return res.status(401).json({ error: 'Token ausente' });

    const payload = verificarToken(token);
    if (!payload) return res.status(401).json({ error: 'Token inválido' });

    // QUERY INTELIGENTE: Busca o usuário E conta os descartes ao mesmo tempo
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.nome, 
        u.email, 
        u.cpf, 
        u.telefone, 
        u.saldo_pontos, 
        u.nivel_usuario, 
        u.is_admin,
        (SELECT COUNT(*)::int FROM descartes WHERE usuario_id = u.id) as total_descartes
      FROM usuarios u
      WHERE u.id = $1
    `, [payload.userId]);
    
    const user = result.rows[0];

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    return res.status(200).json({ user });

  } catch (err) {
    console.error('Erro em /api/me:', err);
    return res.status(500).json({ error: 'Erro interno ao obter perfil' });
  }
}