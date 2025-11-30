import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET as string | undefined;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não está definido. Adicione JWT_SECRET em .env.local ou nas variáveis de ambiente.');
}

export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export function gerarToken(userId: string, email: string, expiresIn: string | number = '7d'): string {
  return jwt.sign({ userId, email }, JWT_SECRET as string, { expiresIn: expiresIn as any });
}

export function verificarToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function extrairTokenDoHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

export async function hashSenha(senha: string): Promise<string> {
  return bcryptjs.hash(senha, 10);
}

export async function compararSenha(senha: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(senha, hash);
}

export function autenticar(req: any): TokenPayload | null {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = extrairTokenDoHeader(authHeader);
  if (!token) return null;
  return verificarToken(token);
}
