import pool from '../lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req: any, res: any) {
  // Configura CORS (para o front conseguir chamar)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  const { nome, email, senha, cpf, telefone } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  try {
    const hash = await bcrypt.hash(senha, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, cpf, telefone, saldo_pontos, nivel_usuario) 
       VALUES ($1, $2, $3, $4, $5, 50, 'Iniciante') 
       RETURNING id, nome, email, cpf, telefone, saldo_pontos, nivel_usuario`,
      [nome, email, hash, cpf || null, telefone || null]
    );

    return res.status(200).json({ success: true, user: result.rows[0] });
  } catch (error: any) {
    console.error(error);
    if (error.code === '23505') { // Código de violação de chave única (email duplicado)
        return res.status(400).json({ error: 'Email já cadastrado.' });
    }
    return res.status(500).json({ error: 'Erro ao criar conta.' });
  }
}
