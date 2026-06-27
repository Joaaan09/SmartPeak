import type { NextFunction, Request, Response } from 'express';
import { AppError } from './error.js';
import { verifyAccessToken } from '../utils/jwt.js';

// Extiende Request con el id del usuario autenticado
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// Exige un Bearer access token válido; rellena req.userId
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError(401, 'No autenticado');
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    throw new AppError(401, 'Token inválido o expirado');
  }
}
