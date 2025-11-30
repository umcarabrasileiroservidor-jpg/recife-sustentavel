import pool from '../src/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

async function uploadToVercelBlob(name: string, buffer: Buffer) {
  // Tentativa de usar a API de Blob do Vercel via REST.
  const token = process.env.VERCEL_BLOB_TOKEN;
  if (!token) throw new Error('VERCEL_BLOB_TOKEN não está definido');

  // 1) Criar metadata (endpoint hipotético)
  const createRes = await fetch('https://api.vercel.com/v1/blob', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, size: buffer.length })
  });

  if (!createRes.ok) {
    const t = await createRes.text();
    throw new Error('Erro criando blob: ' + t);
  }

  const body = await createRes.json();
  // Esperamos receber um campo 'uploadUrl' para PUT e 'publicUrl' para acesso público
  const uploadUrl = body.uploadUrl || body.url;
  const publicUrl = body.publicUrl || body.url || body.public_url;
  if (!uploadUrl) throw new Error('Resposta do Blob não contém uploadUrl');

  // 2) Fazer PUT com os bytes
  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    body: buffer
  });

  if (!putRes.ok) {
    const t = await putRes.text();
    throw new Error('Erro ao enviar blob: ' + t);
  }

  return publicUrl || `https://vercel.blob/${name}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const auth = req.headers?.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token ausente' });

    const payload: any = jwt.verify(token, JWT_SECRET);
    const userId = payload?.userId;
    if (!userId) return res.status(401).json({ error: 'Token inválido' });

    const { type, imageBase64, multiplier } = req.body || {};
    if (!type || !imageBase64) return res.status(400).json({ error: 'type e imageBase64 são obrigatórios' });

    // Verificar último descarte nas últimas 24h
    const lastRes = await pool.query(
      'SELECT created_at FROM descartes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    const last = lastRes.rows[0];
    if (last) {
      const lastTime = new Date(last.created_at).getTime();
      const now = Date.now();
      if (now - lastTime < 24 * 60 * 60 * 1000) {
        return res.status(400).json({ error: 'Já existe um descarte nas últimas 24 horas' });
      }
    }

    // Converter base64 para buffer
    const buffer = Buffer.from(imageBase64, 'base64');
    const filename = `descarte_${userId}_${Date.now()}.jpg`;

    // Upload para Vercel Blob (requer VERCEL_BLOB_TOKEN configurado)
    const imageUrl = await uploadToVercelBlob(filename, buffer);

    // Calcular pontos (exemplo simples)
    const points = Math.max(1, Number(multiplier || 1) * 10);

    // Realizar transação no banco
    const client = await (pool as any).connect();
    try {
      await client.query('BEGIN');

      const insertDescarte = await client.query(
        `INSERT INTO descartes (user_id, type, image_url, points, created_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING id`,
        [userId, type, imageUrl, points]
      );

      const updateUser = await client.query(
        `UPDATE usuarios SET saldo_pontos = COALESCE(saldo_pontos,0) + $1 WHERE id = $2 RETURNING id, saldo_pontos`,
        [points, userId]
      );

      await client.query(
        `INSERT INTO transacoes (user_id, points, tipo, descricao, created_at) VALUES ($1,$2,$3,$4,NOW())`,
        [userId, points, 'descarte', `Descarte tipo ${type}`]
      );

      await client.query('COMMIT');

      const newSaldo = updateUser.rows[0]?.saldo_pontos ?? null;
      return res.status(200).json({ success: true, points, saldo_pontos: newSaldo });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('descarte error', err);
    return res.status(500).json({ error: 'Erro interno ao processar descarte' });
  }
}
