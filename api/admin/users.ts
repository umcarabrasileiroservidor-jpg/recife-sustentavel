import pool from '../db';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // LISTAR
    if (req.method === 'GET') {
      const { rows } = await pool.query(`
        SELECT id, nome, email, cpf, saldo_pontos, nivel_usuario, status_conta,
               to_char(criado_em, 'DD/MM/YYYY') as cadastro,
               (SELECT COUNT(*) FROM descartes WHERE usuario_id = usuarios.id) as total_descartes
        FROM usuarios
        ORDER BY criado_em DESC
      `);
      const users = rows.map((u: any) => ({
        id: u.id,
        name: u.nome,
        email: u.email,
        capivaras: u.saldo_pontos,
        nivel: u.nivel_usuario,
        status: u.status_conta || 'ativo', // Fallback se nulo
        descartes: u.total_descartes,
        cadastro: u.cadastro
      }));
      return res.status(200).json(users);
    }

    // ATUALIZAR STATUS (Banir/Ativar)
    if (req.method === 'PUT') {
      const { id, status } = req.body;
      await pool.query("UPDATE usuarios SET status_conta = $1 WHERE id = $2", [status, id]);
      return res.status(200).json({ success: true });
    }

   // EXCLUIR
    if (req.method === 'DELETE') {
      // Lê do query string (URL) ou do body (fallback)
      const id = req.query.id || req.body.id; 
      await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
      return res.status(200).json({ success: true });
    }

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}