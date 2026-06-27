import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Vida de los tokens
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '30d';

export interface TokenPayload {
  sub: string; // id del usuario
}

// Firma un access token de corta duración
export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId } satisfies TokenPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
}

// Firma un refresh token de larga duración
export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId } satisfies TokenPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
}

// Verifica un access token; lanza si es inválido/expirado
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
}

// Verifica un refresh token; lanza si es inválido/expirado
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}
