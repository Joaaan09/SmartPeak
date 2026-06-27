import { z } from 'zod';
import { ROLE_VALUES, SEX_VALUES, THEME_VALUES } from '../models/User.js';

// Límites razonables para evitar valores absurdos
const heightSchema = z.number().positive().min(50).max(300); // cm
const weightSchema = z.number().positive().min(20).max(500); // kg

// birthDate: cadena ISO que represente una fecha válida y pasada
const birthDateSchema = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), { message: 'Fecha inválida' })
  .refine((v) => new Date(v) < new Date(), { message: 'La fecha debe ser pasada' });

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  sex: z.enum(SEX_VALUES),
  birthDate: birthDateSchema,
  role: z.enum(ROLE_VALUES),
  height: heightSchema,
  weight: weightSchema,
  targetWeight: weightSchema,
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

// Actualización de perfil: todos los campos opcionales pero validados si están
export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1, 'El nombre es obligatorio'),
    sex: z.enum(SEX_VALUES),
    birthDate: birthDateSchema,
    role: z.enum(ROLE_VALUES),
    height: heightSchema,
    weight: weightSchema,
    targetWeight: weightSchema,
    preferences: z
      .object({
        theme: z.enum(THEME_VALUES),
      })
      .partial(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'No hay campos para actualizar',
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
