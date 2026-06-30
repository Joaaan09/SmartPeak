import { z } from 'zod';

// Validación TOLERANTE del payload de Health Auto Export v2.
// Solo garantiza la FORMA EXTERNA: data.metrics[] con name/units/data[].
// El shape interno de cada data point es heterogéneo (qty vs Min/Max/Avg, sueño…)
// y lo maneja el normalizador en services/syncBiometrics.ts, no este schema.
export const syncPayloadSchema = z.object({
  data: z.object({
    metrics: z.array(
      z.object({
        name: z.string(),
        units: z.string().optional(),
        data: z.array(z.record(z.unknown())),
      }),
    ),
  }),
});

export type SyncPayload = z.infer<typeof syncPayloadSchema>;
