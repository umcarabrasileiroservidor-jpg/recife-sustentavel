import pool from '../lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req: any, res: any) {
  // Configura CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  const { email, senha } = req.body;

  try {
    // Busca na tabela 'usuarios'
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const user = rows[0];

    if (!user || !(await bcrypt.compare(senha, user.senha_hash))) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, nome: user.nome }, 
      process.env.JWT_SECRET!, 
      { expiresIn: '7d' }
    );

    // Mapeia para o formato que o Front espera
    return res.status(200).json({ 
      token,
      user: { 
        id: user.id, 
        name: user.nome, 
        email: user.email, 
        balance: user.saldo_pontos,
        cpf: user.cpf,
        telefone: user.telefone,
        nivel_usuario: user.nivel_usuario,
        last_disposal_time: null
      } 
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
