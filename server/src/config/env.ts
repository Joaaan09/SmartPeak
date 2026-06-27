import dotenv from 'dotenv';
import { z } from 'zod';

// Carga las variables del fichero .env antes de validarlas
dotenv.config();

// Esquema de las variables de entorno: falla rápido si falta algo crítico
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI es obligatoria'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET debe tener al menos 16 caracteres'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET debe tener al menos 16 caracteres'),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Mensaje claro y muerte temprana: no arrancamos con configuración inválida
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join('.') || '(raíz)'}: ${i.message}`)
    .join('\n');
  console.error('[env] Configuración de entorno inválida:\n' + issues);
  process.exit(1);
}

// Objeto tipado y de solo lectura con la configuración validada
export const env = Object.freeze({
  ...parsed.data,
  isProd: parsed.data.NODE_ENV === 'production',
  isDev: parsed.data.NODE_ENV === 'development',
});

export type Env = typeof env;
