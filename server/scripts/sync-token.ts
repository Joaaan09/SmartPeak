// sync-token — genera y asigna un token de sync a un usuario, para probar el
// endpoint POST /api/sync/health sin necesidad de login.
// Uso: tsx scripts/sync-token.ts <email>
//   (o vía npm: npm --prefix server run sync:token -- <email>)
//
// El token solo se muestra AQUÍ, en el momento de generarlo: en BD se guarda en
// `syncToken` (select:false) y nunca se expone en respuestas de la API.
import { randomBytes } from 'node:crypto';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';

async function main(): Promise<void> {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    console.error('[sync-token] Falta el email.\n  Uso: tsx scripts/sync-token.ts <email>');
    process.exit(1);
  }

  await connectDB();

  // syncToken es select:false, pero aquí lo asignamos y guardamos: no hace falta seleccionarlo.
  const user = await User.findOne({ email });
  if (!user) {
    console.error(`[sync-token] No existe ningún usuario con email "${email}".`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const token = randomBytes(32).toString('base64url');
  user.set('syncToken', token);
  await user.save();

  console.log('\n[sync-token] Token de sync generado y guardado.');
  console.log(`  email: ${email}`);
  console.log(`  token: ${token}`);
  console.log(
    '\n  Ponlo en el header `x-sync-token` del Atajo de iOS (Health Auto Export)\n' +
      '  al hacer POST a /api/sync/health. No volverá a mostrarse.\n',
  );

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('[sync-token] Error inesperado:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
