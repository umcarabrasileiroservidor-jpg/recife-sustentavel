import pool from './db'; // Importa a conexão que você já tem
import { autenticar } from './auth'; // Reaproveita sua autenticação

export default async function handler(req: any, res: any) {
  // Configura CORS padrão (igual aos outros arquivos)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    // 1. Segurança: Verifica quem está chamando
    const usuario = autenticar(req);
    if (!usuario) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    const { cost, title } = req.body; // Recebe o custo e o nome do prêmio

    // 2. Verifica saldo no Banco
    const { rows } = await pool.query('SELECT saldo_pontos FROM usuarios WHERE id = $1', [usuario.userId]);
    const userDb = rows[0];

    if (!userDb || userDb.saldo_pontos < cost) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    // 3. Transação Atômica (Desconta e Registra)
    // (Fazemos tudo de uma vez para não dar erro de contabilidade)
    const client = await (pool as any).connect();
    try {
      await client.query('BEGIN');

      // Debita
      await client.query('UPDATE usuarios SET saldo_pontos = saldo_pontos - $1 WHERE id = $2', [cost, usuario.userId]);

      // Registra no histórico
      await client.query(
        `INSERT INTO transacoes (usuario_id, tipo, descricao, valor, criado_em) 
         VALUES ($1, 'resgate', $2, $3, NOW())`,
        [usuario.userId, `Resgate: ${title}`, -cost]
      );

      await client.query('COMMIT');

      return res.status(200).json({ success: true, novoSaldo: userDb.saldo_pontos - cost });
    } catch (err) {
      await client.query('ROLLBACK'); // Desfaz se der erro
      throw err;
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('recompensa error', error);
    return res.status(500).json({ error: error.message || 'Erro ao processar resgate' });
  }
}
