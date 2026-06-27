import mongoose from 'mongoose';
import { env } from './env.js';

// Conecta a MongoDB. No tumba el proceso si Mongo no está disponible:
// loguea el error claramente para que quede patente que falta Mongo,
// pero deja que el servidor HTTP siga escuchando.
export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);

  // Eventos de conexión para visibilidad en consola
  mongoose.connection.on('connected', () => {
    console.log('[db] Conectado a MongoDB');
  });
  mongoose.connection.on('error', (err) => {
    console.error('[db] Error de conexión a MongoDB:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[db] Desconectado de MongoDB');
  });

  try {
    await mongoose.connect(env.MONGODB_URI, {
      // Tiempo de espera corto para no bloquear el arranque si no hay Mongo
      serverSelectionTimeoutMS: 5000,
    });
  } catch (err) {
    // No logueamos env.MONGODB_URI: puede incluir credenciales en producción.
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      '[db] No se pudo conectar a MongoDB. ' +
        'El servidor HTTP seguirá levantado, pero las operaciones de base de datos fallarán ' +
        'hasta que MongoDB esté disponible.\n      Detalle: ' +
        message,
    );
  }
}
