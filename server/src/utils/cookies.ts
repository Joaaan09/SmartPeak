import type { CookieOptions, Response } from 'express';
import { env } from '../config/env.js';

export const REFRESH_COOKIE_NAME = 'refreshToken';

// La cookie de refresh solo viaja a las rutas de auth
const REFRESH_COOKIE_PATH = '/api/auth';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function baseOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProd, // solo HTTPS en producción
    path: REFRESH_COOKIE_PATH,
  };
}

// Asienta la cookie httpOnly con el refresh token
export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...baseOptions(),
    maxAge: THIRTY_DAYS_MS,
  });
}

// Limpia la cookie de refresh (logout)
export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, baseOptions());
}
