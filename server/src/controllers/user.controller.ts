import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { AppError } from '../middleware/error.js';
import { updateUserSchema } from '../validation/auth.schema.js';

// PATCH /api/users/me — actualiza campos del perfil (incluido el rol)
export async function updateMe(req: Request, res: Response): Promise<void> {
  const data = updateUserSchema.parse(req.body);

  const user = await User.findById(req.userId);
  if (!user) {
    throw new AppError(404, 'Usuario no encontrado');
  }

  // Aplicamos solo los campos presentes
  if (data.name !== undefined) user.name = data.name;
  if (data.sex !== undefined) user.sex = data.sex;
  if (data.birthDate !== undefined) user.birthDate = new Date(data.birthDate);
  if (data.role !== undefined) user.role = data.role;
  if (data.height !== undefined) user.height = data.height;
  if (data.weight !== undefined) user.weight = data.weight;
  if (data.targetWeight !== undefined) user.targetWeight = data.targetWeight;
  if (data.preferences?.theme !== undefined) {
    user.preferences = { ...user.preferences, theme: data.preferences.theme };
  }

  await user.save();

  res.status(200).json({ user });
}
