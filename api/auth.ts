/**
 * ARQUIVO: api/auth.ts
 * DESCRIÇÃO: Helpers de Autenticação (JWT + Bcrypt)
 */

import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import type { SignOptions } from 'jsonwebtoken';

// Função auxiliar para pegar a chave com segurança
function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("❌ ERRO CRÍTICO: JWT_SECRET não encontrado nas variáveis de ambiente!");
    throw new Error('JWT_SECRET_MISSING');
  }
  return secret;
}

export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export function gerarToken(userId: string, email: string, expiresIn: string | number = '7d'): string {
  const secret = getSecret(); // Verifica só na hora de usar
  const options: SignOptions = { expiresIn: expiresIn as any };
  return jwt.sign({ userId, email }, secret, options);
}

export function verificarToken(token: string): TokenPayload | null {
  try {
    const secret = getSecret(); // Verifica só na hora de usar
    const decoded = jwt.verify(token, secret) as TokenPayload;
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