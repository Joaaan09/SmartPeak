// Fixtures de payloads de Health Auto Export (HAE v2) para los tests del sync.
// Representan la estructura REAL: { data: { metrics: [ { name, units, data } ] } }.
// Los puntos horarios llevan la hora en `date` ("YYYY-MM-DD HH:mm:ss ±ZZZZ").

import type { SyncPayload } from '../../validation/sync.schema.js';

// Tramos horarios de pasos del 24/06 cuya SUMA es 18.622 (validación cruzada real).
// Mezclamos decimales (prorrateo de HAE) para que el redondeo del total importe.
const steps2406 = [
  { t: '07:00', qty: 1200.4 }, // -> 1200
  { t: '08:00', qty: 3915.51 }, // -> 3916
  { t: '09:00', qty: 2100.0 }, // -> 2100
  { t: '12:00', qty: 4000.49 }, // -> 4000
  { t: '15:00', qty: 3915.51 }, // -> 3916
  { t: '19:00', qty: 3489.59 }, // -> 3490
] as const;
// Suma de los tramos redondeados = 18622 (= 18.622, validación cruzada real).

const heart2406 = [
  { t: '08:00', Min: 80, Avg: 94.33, Max: 116 },
  { t: '12:00', Min: 70, Avg: 88.0, Max: 130 },
  { t: '19:00', Min: 60, Avg: 100.67, Max: 150 },
] as const;
// min esperado = 60, max esperado = 150, avg = (94.33+88+100.67)/3 = 94.33...

const energy2406 = [
  { t: '09:00', qty: 210.45 }, // kJ
  { t: '12:00', qty: 418.4 },
  { t: '19:00', qty: 100.0 },
] as const;

// Payload horario de un solo día (24/06) con FC, pasos, energía y sueño.
export function hourlyPayloadDay2406(): SyncPayload {
  return {
    data: {
      metrics: [
        {
          name: 'step_count',
          units: 'count',
          data: steps2406.map((s) => ({
            date: `2026-06-24 ${s.t}:00 +0200`,
            qty: s.qty,
            source: 'KSIX Ring|iPhone de Joan',
          })),
        },
        {
          name: 'active_energy',
          units: 'kJ',
          data: energy2406.map((e) => ({
            date: `2026-06-24 ${e.t}:00 +0200`,
            qty: e.qty,
            source: 'KSIX Ring',
          })),
        },
        {
          name: 'heart_rate',
          units: 'count/min',
          data: heart2406.map((h) => ({
            date: `2026-06-24 ${h.t}:00 +0200`,
            Min: h.Min,
            Avg: h.Avg,
            Max: h.Max,
            source: 'KSIX Ring',
          })),
        },
        {
          name: 'sleep_analysis',
          units: 'hr',
          data: [
            {
              date: '2026-06-24 00:00:00 +0200',
              totalSleep: 7.5,
              deep: 1.2,
              rem: 1.8,
              core: 4.1,
              awake: 0.4,
              sleepStart: '2026-06-23 23:30:00 +0200',
              sleepEnd: '2026-06-24 07:00:00 +0200',
              source: 'KSIX Ring',
            },
          ],
        },
      ],
    },
  };
}

// Payload horario multi-día (24 y 25/06). Sirve para comprobar que se crea
// un documento por día y que las series quedan separadas y ordenadas.
export function hourlyPayloadMultiDay(): SyncPayload {
  const day2406 = hourlyPayloadDay2406();
  return {
    data: {
      metrics: [
        ...day2406.data.metrics,
        {
          name: 'step_count',
          units: 'count',
          data: [
            // Llegan desordenados a propósito: la serie debe salir ordenada.
            { date: '2026-06-25 18:00:00 +0200', qty: 500, source: 'KSIX Ring' },
            { date: '2026-06-25 06:00:00 +0200', qty: 1000, source: 'KSIX Ring' },
          ],
        },
        {
          name: 'heart_rate',
          units: 'count/min',
          data: [
            { date: '2026-06-25 06:00:00 +0200', Min: 55, Avg: 70, Max: 90, source: 'KSIX Ring' },
          ],
        },
      ],
    },
  };
}

// Payload DIARIO antiguo (1 punto/día, formato "Export Health Data"): el `date`
// trae solo la fecha, sin hora. Debe seguir produciendo el agregado correcto y
// dejar las series horarias AUSENTES (no hay hora válida que extraer).
export function legacyDailyPayload(): SyncPayload {
  return {
    data: {
      metrics: [
        {
          name: 'step_count',
          units: 'count',
          data: [{ date: '2026-06-20', qty: 8500, source: 'iPhone' }],
        },
        {
          name: 'active_energy',
          units: 'kJ',
          data: [{ date: '2026-06-20', qty: 2092, source: 'iPhone' }],
        },
        {
          name: 'heart_rate',
          units: 'count/min',
          data: [{ date: '2026-06-20', Min: 50, Avg: 65, Max: 140, source: 'iPhone' }],
        },
      ],
    },
  };
}
