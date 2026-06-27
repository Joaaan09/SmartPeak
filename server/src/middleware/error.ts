import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

// Error controlado de aplicación: status + mensaje seguro para el cliente
export class AppError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}

// Manejador de errores central. Debe registrarse el último en app.ts.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Express exige los 4 args
  _next: NextFunction,
): void {
  // Errores de validación zod -> 400 con mapa { campo: mensaje }
  if (err instanceof ZodError) {
    const errors: Record<string, string> = {};
    for (const issue of err.issues) {
      const key = issue.path.join('.') || '(raíz)';
      // Conservamos el primer error por campo
      if (!(key in errors)) errors[key] = issue.message;
    }
    res.status(400).json({ message: 'Datos inválidos', errors });
    return;
  }

  // Errores controlados de la aplicación
  if (err instanceof AppError) {
    res.status(err.status).json({ message: err.message });
    return;
  }

  // Cualquier otra cosa: 500 sin filtrar detalles internos
  console.error('[error] No controlado:', err);
  res.status(500).json({ message: 'Error interno del servidor' });
}
