import type { Request, Response } from 'express';

// POST /api/sync/health — recibe el JSON de salud del Atajo de iOS (Health Auto Export).
// PRIMER PASO: aún NO se persiste la biometría. Solo autenticamos por token de sync
// (vía requireSyncToken) e inspeccionamos la estructura real del payload por consola
// para modelar bien la persistencia en el siguiente paso.
export async function syncHealth(req: Request, res: Response): Promise<void> {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const keys = Object.keys(body);
  const sizeBytes = Buffer.byteLength(JSON.stringify(body));

  console.log(
    `[sync] Payload recibido · userId=${req.syncUserId} · keys=[${keys.join(', ')}] · ~${sizeBytes} bytes`,
  );

  // Un nivel de profundidad: para cada key cuyo valor sea objeto/array,
  // logueamos sus sub-keys de primer nivel (sin volcar todo el contenido).
  for (const key of keys) {
    const value = body[key];
    if (Array.isArray(value)) {
      const firstItem = value[0];
      const itemKeys =
        firstItem && typeof firstItem === 'object'
          ? Object.keys(firstItem as Record<string, unknown>)
          : [];
      console.log(
        `[sync]   ${key}: array(${value.length})` +
          (itemKeys.length ? ` · keys[0]=[${itemKeys.join(', ')}]` : ''),
      );
    } else if (value && typeof value === 'object') {
      const subKeys = Object.keys(value as Record<string, unknown>);
      console.log(`[sync]   ${key}: object · keys=[${subKeys.join(', ')}]`);
    }
  }

  res.status(200).json({
    message: 'Sincronización recibida',
    userId: req.syncUserId,
    keys,
  });
}
