// mongo-dev — levanta un MongoDB local de DESARROLLO sin instalar nada en el sistema.
// Usa mongodb-memory-server fijado al puerto 27017 con datos PERSISTENTES en server/.mongo-data,
// de modo que lo que registres no se pierde al reiniciar. Coincide con MONGODB_URI del .env.
// Uso: npm run db:dev   ·   parar con Ctrl+C.
import { MongoMemoryServer } from 'mongodb-memory-server';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const dbPath = join(here, '..', '.mongo-data');
mkdirSync(dbPath, { recursive: true });

console.log('[mongo-dev] Iniciando MongoDB local (la primera vez descarga el binario de mongod)…');

const server = await MongoMemoryServer.create({
  instance: { port: 27017, dbPath, storageEngine: 'wiredTiger' },
});

console.log(`[mongo-dev] Listo. Escuchando en ${server.getUri()}`);
console.log('[mongo-dev] Datos en server/.mongo-data · Ctrl+C para parar.');

const stop = async () => {
  console.log('\n[mongo-dev] Parando…');
  await server.stop({ doCleanup: false }); // conserva los datos en disco
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
