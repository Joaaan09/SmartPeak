import { z } from 'zod';
import type { RegisterPayload, Role, Sex } from '../../auth/types';

// Esquema Zod del formulario de registro (única fuente de verdad entre pasos).
// Validamos por paso con `trigger(camposDelPaso)`; este esquema define las reglas
// de cada campo. Rangos físicos plausibles según DESIGN/dominio (powerlifting/salud).

const today = () => new Date(new Date().toDateString());

export const registerSchema = z
  .object({
    // Paso 1 · Cuenta
    email: z
      .string()
      .min(1, 'Introduce tu correo.')
      .email('Correo no válido.'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres.'),
    confirmPassword: z.string().min(1, 'Repite la contraseña.'),

    // Paso 2 · Perfil
    name: z
      .string()
      .trim()
      .min(2, 'Introduce tu nombre.'),
    sex: z.enum(['male', 'female', 'other'], {
      errorMap: () => ({ message: 'Elige una opción.' }),
    }),
    birthDate: z
      .string()
      .min(1, 'Introduce tu fecha de nacimiento.')
      .refine((value) => !Number.isNaN(Date.parse(value)), 'Fecha no válida.')
      .refine((value) => new Date(value) < today(), 'Debe ser una fecha pasada.')
      .refine(
        (value) => new Date(value) > new Date('1900-01-01'),
        'Fecha no plausible.',
      ),

    // Paso 3 · Objetivo
    role: z.enum(['powerlifting', 'hypertrophy', 'general_health'], {
      errorMap: () => ({ message: 'Elige un objetivo.' }),
    }),

    // Paso 4 · Datos físicos
    height: z
      .number({ invalid_type_error: 'Introduce tu altura.' })
      .min(100, 'Entre 100 y 250 cm.')
      .max(250, 'Entre 100 y 250 cm.'),
    weight: z
      .number({ invalid_type_error: 'Introduce tu peso.' })
      .min(30, 'Entre 30 y 300 kg.')
      .max(300, 'Entre 30 y 300 kg.'),
    targetWeight: z
      .number({ invalid_type_error: 'Introduce tu peso objetivo.' })
      .min(30, 'Entre 30 y 300 kg.')
      .max(300, 'Entre 30 y 300 kg.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

/** Nombre de cada campo del formulario por su clave (para mapear errores 400). */
export type RegisterField = keyof RegisterFormValues;

/** Campos que valida cada paso (para `trigger` por paso). */
export const STEP_FIELDS: RegisterField[][] = [
  ['email', 'password', 'confirmPassword'], // Paso 1
  ['name', 'sex', 'birthDate'], // Paso 2
  ['role'], // Paso 3
  ['height', 'weight', 'targetWeight'], // Paso 4
  [], // Paso 5 (resumen, sin campos propios)
];

/** Dado un campo, devuelve el índice (0-based) del paso que lo contiene. */
export function stepOfField(field: string): number {
  const idx = STEP_FIELDS.findIndex((fields) =>
    (fields as string[]).includes(field),
  );
  return idx === -1 ? 0 : idx;
}

/** Construye el payload del contrato a partir de los valores del formulario. */
export function toRegisterPayload(values: RegisterFormValues): RegisterPayload {
  return {
    email: values.email.trim(),
    password: values.password,
    name: values.name.trim(),
    sex: values.sex as Sex,
    // El input date ya entrega 'YYYY-MM-DD'.
    birthDate: values.birthDate,
    role: values.role as Role,
    height: values.height,
    weight: values.weight,
    targetWeight: values.targetWeight,
  };
}
