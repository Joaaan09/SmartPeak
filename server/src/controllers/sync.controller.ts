import type { Request, Response } from 'express';
import { syncPayloadSchema } from '../validation/sync.schema.js';
import { ingestHealthPayload } from '../services/syncBiometrics.js';

// POST /api/sync/health — recibe el JSON de salud del Atajo de iOS (Health Auto Export).
// Valida la forma externa con Zod, delega la normalización/persistencia en el servicio
// y devuelve un resumen de los días y métricas guardadas. El usuario ya viene
// autenticado por requireSyncToken (req.syncUserId).
export async function syncHealth(req: Request, res: Response): Promise<void> {
  const payload = syncPayloadSchema.parse(req.body);
  const result = await ingestHealthPayload(req.syncUserId!, payload);

  const savedCount = Object.values(result.metricsByDay).reduce(
    (acc, metrics) => acc + metrics.length,
    0,
  );
  console.log(
    `[sync] userId=${req.syncUserId} días=[${result.days.join(', ')}] métricas guardadas=${savedCount}`,
  );

  res.status(200).json({
    message: 'Sincronización guardada',
    days: result.days,
    saved: result.metricsByDay,
  });
}
