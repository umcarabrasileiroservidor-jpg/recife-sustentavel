import pool from '../db'; 
import { compararSenha, gerarToken } from '../auth'; 

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let requestBody = req.body;
  if (typeof requestBody === 'string') {
    try { requestBody = JSON.parse(requestBody); } catch (e) { return res.status(400).json({ error: 'Body JSON inválido' }); }
  }
  const { email, senha } = requestBody || {};
  if (!email || !senha) return res.status(400).json({ error: 'email e senha são obrigatórios' });

  try {
    // Busca usuário
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const userDb = result.rows[0];
    
    if (!userDb) return res.status(401).json({ error: 'Credenciais inválidas' });

    const ok = await compararSenha(senha, userDb.senha_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = gerarToken(userDb.id, userDb.email);
    delete userDb.senha_hash;

    // CORREÇÃO: Retorna 'usuario' para bater com o Frontend
    return res.status(200).json({ 
      success: true, 
      token, 
      usuario: {
        id: userDb.id,
        nome: userDb.nome,
        email: userDb.email,
        cpf: userDb.cpf,
        telefone: userDb.telefone,
        saldo_pontos: userDb.saldo_pontos,
        nivel_usuario: userDb.nivel_usuario,
        is_admin: userDb.is_admin
      }
    });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ error: 'Erro interno ao autenticar' });
  }
}