import pool from './db';
import { autenticar } from './auth';

async function uploadToVercelBlob(name: string, buffer: Buffer) {
  const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_TOKEN;
  if (!token) throw new Error('Token do Vercel Blob não está definido. Configure BLOB_READ_WRITE_TOKEN ou VERCEL_BLOB_TOKEN.');

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
  const uploadUrl = body.uploadUrl || body.url;
  const publicUrl = body.publicUrl || body.url || body.public_url;
  if (!uploadUrl) throw new Error('Resposta do Blob não contém uploadUrl');

  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/octet-stream' },
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
    const payload = autenticar(req);
    if (!payload) return res.status(401).json({ error: 'Token inválido ou ausente' });
    const userId = payload.userId;

    const { tipo_residuo, imageBase64, multiplicador_volume } = req.body || {};
    if (!tipo_residuo || !imageBase64) return res.status(400).json({ error: 'tipo_residuo e imageBase64 são obrigatórios' });

    const lastRes = await pool.query(
      'SELECT criado_em FROM descartes WHERE usuario_id = $1 ORDER BY criado_em DESC LIMIT 1',
      [userId]
    );
    const last = lastRes.rows[0];
    if (last) {
      const lastTime = new Date(last.criado_em).getTime();
      const now = Date.now();
      if (now - lastTime < 24 * 60 * 60 * 1000) {
        return res.status(400).json({ error: 'Já existe um descarte nas últimas 24 horas' });
      }
    }

    const buffer = Buffer.from(imageBase64, 'base64');
    const filename = `descarte_${userId}_${Date.now()}.jpg`;
    const imageUrl = await uploadToVercelBlob(filename, buffer);

    const points = Math.max(1, Number(multiplicador_volume || 1) * 10);

    const client = await (pool as any).connect();
    try {
      await client.query('BEGIN');

      const descarteResult = await client.query(
        `INSERT INTO descartes (usuario_id, tipo_residuo, multiplicador_volume, pontos_ganhos, url_foto, validado_ia, criado_em)
         VALUES ($1, $2, $3, $4, $5, true, NOW()) RETURNING id, pontos_ganhos`,
        [userId, tipo_residuo, multiplicador_volume || 1, points, imageUrl]
      );

      const descarte = descarteResult.rows[0];

      await client.query(
        'UPDATE usuarios SET saldo_pontos = COALESCE(saldo_pontos,0) + $1 WHERE id = $2',
        [descarte.pontos_ganhos, userId]
      );

      await client.query(
        `INSERT INTO transacoes (usuario_id, tipo, descricao, valor, criado_em)
         VALUES ($1, 'ganho', $2, $3, NOW())`,
        [userId, `Descarte de ${tipo_residuo}`, descarte.pontos_ganhos]
      );

      await client.query('COMMIT');

      return res.status(200).json({ success: true, descarte_id: descarte.id, points: descarte.pontos_ganhos });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('descarte error', err);
    return res.status(500).json({ error: 'Erro interno ao processar descarte', details: err.message });
  }
}
