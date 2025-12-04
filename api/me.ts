import pool from './db';
import { verificarToken, extrairTokenDoHeader } from './auth';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const token = extrairTokenDoHeader(req.headers.authorization);
    if (!token) return res.status(401).json({ error: 'Token ausente' });

    const payload = verificarToken(token);
    if (!payload) return res.status(401).json({ error: 'Token inválido' });

    const result = await pool.query('SELECT id, nome, email, cpf, telefone, saldo_pontos, nivel_usuario, is_admin FROM usuarios WHERE id = $1', [payload.userId]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });

    return res.status(200).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}