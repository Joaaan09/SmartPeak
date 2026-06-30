import type { NextFunction, Request, Response } from 'express';
import { AppError } from './error.js';
import { User } from '../models/User.js';

// Extiende Request con el id del usuario autenticado por token de sync
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      syncUserId?: string;
    }
  }
}

// Exige un token de sync válido en el header `x-sync-token`; rellena req.syncUserId.
// Es async (consulta a Mongo): se monta envuelto en asyncHandler para que sus
// rechazos lleguen al manejador de errores central.
export async function requireSyncToken(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.headers['x-sync-token'];

  if (!token || typeof token !== 'string') {
    throw new AppError(401, 'Token de sync ausente');
  }

  const user = await User.findOne({ syncToken: token }).select('_id');
  if (!user) {
    throw new AppError(401, 'Token de sync inválido');
  }

  req.syncUserId = user.id;
  next();
}
