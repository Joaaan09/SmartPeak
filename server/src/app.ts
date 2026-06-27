import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.js';
import apiRoutes from './routes/index.js';

export function createApp() {
  const app = express();

  // Cabeceras de seguridad
  app.use(helmet());

  // CORS con credenciales para permitir la cookie httpOnly desde el cliente
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(cookieParser());

  // Logs de petición solo en desarrollo
  if (env.isDev) {
    app.use(morgan('dev'));
  }

  // Todas las rutas de la API cuelgan de /api
  app.use('/api', apiRoutes);

  // Manejador de errores: siempre el último
  app.use(errorHandler);

  return app;
}
