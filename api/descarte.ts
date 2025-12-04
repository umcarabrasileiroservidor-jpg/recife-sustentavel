import pool from './db';
import { autenticar } from './auth';

async function uploadToVercelBlob(name: string, buffer: Buffer) {
  const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_TOKEN;
  if (!token) throw new Error('Token Blob não configurado');

  try {
      const createRes = await fetch('https://api.vercel.com/v1/blob', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, size: buffer.length })
      });
      
      if (!createRes.ok) throw new Error(`Erro Vercel Blob: ${createRes.statusText}`);
      
      const body = await createRes.json();
      await fetch(body.uploadUrl, { method: 'PUT', body: buffer as any });
      return body.url;
  } catch (e: any) {
      console.error("❌ Erro no Upload Blob:", e);
      throw e;
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const usuario = autenticar(req);
    if (!usuario) return res.status(401).json({ error: 'Login necessário' });

    const { tipo_residuo, imageBase64, multiplicador_volume } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'Foto obrigatória' });

    console.log(`📸 Recebendo descarte de ${usuario.userId}...`);

    // 1. Upload
    const buffer = Buffer.from(imageBase64.split(',')[1], 'base64');
    const url_foto = await uploadToVercelBlob(`descarte_${usuario.userId}_${Date.now()}.jpg`, buffer);

    console.log("✅ Upload concluído:", url_foto);

    // 2. Estimativa
    const pontosEstimados = Math.round(20 * (multiplicador_volume || 1));

    // 3. Salvar (Agora aceita pontos_ganhos NULL)
    await pool.query(
      `INSERT INTO descartes (usuario_id, tipo_residuo, pontos_estimados, pontos_ganhos, url_foto, status, criado_em)
       VALUES ($1, $2, $3, NULL, $4, 'pendente', NOW())`,
      [usuario.userId, tipo_residuo || 'geral', pontosEstimados, url_foto]
    );

    console.log("✅ Salvo no banco!");

    return res.status(200).json({ success: true, message: 'Enviado!', status: 'pendente' });

  } catch (err: any) {
    console.error("🔥 Erro no Descarte:", err);
    return res.status(500).json({ error: err.message });
  }
}