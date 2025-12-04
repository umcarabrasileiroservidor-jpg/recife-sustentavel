import pool from './db';
import { autenticar } from './auth';
import { put } from '@vercel/blob'; // Importa o SDK oficial

export default async function handler(req: any, res: any) {
  // Configuração de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // 1. Autenticação
    const usuario = autenticar(req);
    if (!usuario) return res.status(401).json({ error: 'Login necessário' });

    const { tipo_residuo, imageBase64, multiplicador_volume } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'Foto obrigatória' });

    // 2. Preparar a imagem
    // Remove o cabeçalho "data:image/jpeg;base64," para obter apenas os dados
    const base64Data = imageBase64.split(',')[1]; 
    const buffer = Buffer.from(base64Data, 'base64');
    const filename = `descarte_${usuario.userId}_${Date.now()}.jpg`;

    // 3. Upload usando o SDK do Vercel Blob (Simples e Seguro)
    const blob = await put(filename, buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_TOKEN,
      contentType: 'image/jpeg', // Garante que o navegador abra como imagem
    });

    const url_foto = blob.url;
    console.log("✅ Upload concluído:", url_foto);

    // 4. Calcular Estimativa (Lógica de negócio)
    const pontosEstimados = Math.round(20 * (multiplicador_volume || 1));

    // 5. Salvar no Banco (Status Pendente)
    await pool.query(
      `INSERT INTO descartes (usuario_id, tipo_residuo, pontos_estimados, pontos_ganhos, url_foto, status, criado_em)
       VALUES ($1, $2, $3, NULL, $4, 'pendente', NOW())`,
      [usuario.userId, tipo_residuo || 'geral', pontosEstimados, url_foto]
    );

    console.log("✅ Salvo no banco!");

    return res.status(200).json({ 
      success: true, 
      message: 'Enviado para análise!',
      status: 'pendente'
    });

  } catch (err: any) {
    console.error("🔥 Erro no Descarte:", err);
    return res.status(500).json({ error: err.message });
  }
}