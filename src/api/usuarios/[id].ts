import pool from '../../lib/db';
import { autenticar } from '../../lib/auth';

export default async function handler(req: any, res: any) {
  const payload = autenticar(req);
  if (!payload) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const result = await pool.query(
        `SELECT id, nome, email, cpf, telefone, saldo_pontos, nivel_usuario, criado_em, atualizado_em
         FROM usuarios WHERE id = $1`,
        [payload.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const usuario = result.rows[0];
      return res.status(200).json({ usuario });
    } catch (error: any) {
      console.error('Erro ao buscar perfil:', error);
      return res.status(500).json({ error: error.message || 'Erro interno' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { nome, telefone } = req.body;

      const result = await pool.query(
        `UPDATE usuarios SET nome = COALESCE($1, nome), telefone = COALESCE($2, telefone)
         WHERE id = $3
         RETURNING id, nome, email, cpf, telefone, saldo_pontos, nivel_usuario`,
        [nome || null, telefone || null, payload.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.status(200).json({ usuario: result.rows[0] });
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      return res.status(500).json({ error: error.message || 'Erro interno' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
