import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

async function bootstrap(): Promise<void> {
  // Intentamos conectar a Mongo (no bloquea el arranque del HTTP si falla)
  await connectDB();

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`[server] Escuchando en http://localhost:${env.PORT} (${env.NODE_ENV})`);
    console.log(`[server] CORS permitido para ${env.CLIENT_ORIGIN}`);
  });
}

bootstrap().catch((err) => {
  console.error('[server] Fallo fatal en el arranque:', err);
  process.exit(1);
});
