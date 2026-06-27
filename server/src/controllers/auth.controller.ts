import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { AppError } from '../middleware/error.js';
import { loginSchema, registerSchema } from '../validation/auth.schema.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { clearRefreshCookie, REFRESH_COOKIE_NAME, setRefreshCookie } from '../utils/cookies.js';

const BCRYPT_ROUNDS = 12;

// POST /api/auth/register
export async function register(req: Request, res: Response): Promise<void> {
  const data = registerSchema.parse(req.body);

  // Comprobamos duplicado antes de hashear (ahorra trabajo y da 409 limpio)
  const existing = await User.findOne({ email: data.email.toLowerCase() }).lean();
  if (existing) {
    throw new AppError(409, 'Ya existe una cuenta con ese email');
  }

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  const user = await User.create({
    email: data.email,
    passwordHash,
    name: data.name,
    sex: data.sex,
    birthDate: new Date(data.birthDate),
    role: data.role,
    height: data.height,
    weight: data.weight,
    targetWeight: data.targetWeight,
  });

  const accessToken = signAccessToken(user.id);
  setRefreshCookie(res, signRefreshToken(user.id));

  res.status(201).json({ user, accessToken });
}

// POST /api/auth/login
export async function login(req: Request, res: Response): Promise<void> {
  const data = loginSchema.parse(req.body);

  // Necesitamos el hash explícitamente (select:false en el modelo)
  const user = await User.findOne({ email: data.email.toLowerCase() }).select('+passwordHash');

  // Mensaje genérico para no revelar si el email existe
  if (!user) {
    throw new AppError(401, 'Credenciales inválidas');
  }

  const ok = await bcrypt.compare(data.password, user.passwordHash);
  if (!ok) {
    throw new AppError(401, 'Credenciales inválidas');
  }

  const accessToken = signAccessToken(user.id);
  setRefreshCookie(res, signRefreshToken(user.id));

  // toJSON elimina el passwordHash en la respuesta
  res.status(200).json({ user, accessToken });
}

// POST /api/auth/refresh
export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  if (!token) {
    throw new AppError(401, 'No hay sesión activa');
  }

  let userId: string;
  try {
    userId = verifyRefreshToken(token).sub;
  } catch {
    throw new AppError(401, 'Sesión inválida o expirada');
  }

  // Aseguramos que el usuario sigue existiendo
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new AppError(401, 'Sesión inválida');
  }

  // Rotamos la cookie de refresh y emitimos nuevo access token
  setRefreshCookie(res, signRefreshToken(userId));
  res.status(200).json({ accessToken: signAccessToken(userId) });
}

// POST /api/auth/logout
export async function logout(_req: Request, res: Response): Promise<void> {
  clearRefreshCookie(res);
  res.status(200).json({ ok: true });
}

// GET /api/auth/me
export async function me(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.userId);
  if (!user) {
    throw new AppError(404, 'Usuario no encontrado');
  }
  res.status(200).json({ user });
}
