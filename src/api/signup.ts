import pool from '../lib/db';
import bcryptjs from 'bcryptjs';

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
  
  console.log('\n🔐 [SIGNUP] Iniciando cadastro...');
  
  let requestBody = req.body;
  if (typeof requestBody === 'string') {
    try {
      requestBody = JSON.parse(requestBody);
    } catch (e) {
      console.error('❌ [SIGNUP] Erro ao parsear JSON:', requestBody);
      return res.status(400).json({ error: 'Body JSON inválido' });
    }
  }

  const { nome, email, senha, cpf, telefone } = requestBody || {};
  console.log('📝 [SIGNUP] Dados recebidos:', { nome: nome ? '✅' : '❌', email: email ? '✅' : '❌', senha: senha ? '✅' : '❌', cpf: cpf ? '✅' : '❌', telefone: telefone ? '✅' : '❌' });

  if (!nome || !email || !senha) {
    console.error('❌ [SIGNUP] Dados obrigatórios faltando:', { nome, email, senha: '***' });
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }

  try {
    console.log('🔒 [SIGNUP] Criptografando senha...');
    const hash = await bcryptjs.hash(senha, 10);
    console.log('✅ [SIGNUP] Senha criptografada com sucesso');

    console.log('💾 [SIGNUP] Inserindo usuário no banco...');
    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, cpf, telefone, saldo_pontos, nivel_usuario) 
       VALUES ($1, $2, $3, $4, $5, 50, 'Iniciante') 
       RETURNING id, nome, email, cpf, telefone, saldo_pontos, nivel_usuario`,
      [nome, email, hash, cpf || null, telefone || null]
    );

    const usuario = result.rows[0];
    console.log('✅ [SIGNUP] Usuário cadastrado com sucesso!', { id: usuario.id, email: usuario.email });

    return res.status(201).json({ success: true, user: usuario });
  } catch (error: any) {
    console.error('❌ [SIGNUP] ERRO FATAL:', error.message);
    console.error('📋 [SIGNUP] Código do erro:', error.code);
    console.error('🔍 [SIGNUP] Stack completo:', error.stack);
    
    if (error.code === '23505') {
      console.warn('⚠️ [SIGNUP] Email duplicado:', email);
      return res.status(409).json({ error: 'Email já cadastrado.' });
    }
    
    if (error.message && error.message.includes('relation "usuarios" does not exist')) {
      console.error('❌ [SIGNUP] TABELA NÃO EXISTE: usuarios');
      return res.status(503).json({ error: 'Tabela de usuários não configurada no banco' });
    }

    if (error.message && error.message.includes('password authentication failed')) {
      console.error('❌ [SIGNUP] ERRO DE AUTENTICAÇÃO: Verifique DATABASE_URL');
      return res.status(503).json({ error: 'Erro ao conectar ao banco - credenciais inválidas' });
    }

    return res.status(500).json({ error: 'Erro ao criar conta.', details: error.message });
  }
}
