// Tipos del dominio de autenticación, alineados con el contrato del backend.

export type Sex = 'male' | 'female' | 'other';
export type Role = 'powerlifting' | 'hypertrophy' | 'general_health';

/** Usuario tal y como lo devuelve el backend. */
export type User = {
  id: string;
  email: string;
  name: string;
  sex: Sex;
  birthDate: string; // Se envía como 'YYYY-MM-DD'; el backend lo devuelve como ISO completo
  role: Role;
  height: number;
  weight: number;
  targetWeight: number;
  preferences: { theme: string };
  createdAt: string;
  updatedAt: string;
};

/** Payload de alta (POST /auth/register). */
export type RegisterPayload = {
  email: string;
  password: string;
  name: string;
  sex: Sex;
  birthDate: string; // 'YYYY-MM-DD'
  role: Role;
  height: number;
  weight: number;
  targetWeight: number;
};

/** Respuesta de login/register. */
export type AuthResponse = {
  user: User;
  accessToken: string;
};

/** Etiquetas legibles en español para el rol. */
export const ROLE_LABELS: Record<Role, string> = {
  powerlifting: 'Powerlifting',
  hypertrophy: 'Hipertrofia',
  general_health: 'Salud general',
};

/** Etiquetas legibles en español para el sexo. */
export const SEX_LABELS: Record<Sex, string> = {
  male: 'Hombre',
  female: 'Mujer',
  other: 'Otro',
};
