import { DailyMetrics } from '../models/DailyMetrics.js';
import type { SyncPayload } from '../validation/sync.schema.js';

// Ingesta de biometría del Atajo de iOS (Health Auto Export v2).
// Parsea el payload heterogéneo, normaliza por métrica y upserta un documento
// diario por (userId, date) MERGEANDO solo las métricas presentes, sin pisar
// campos manuales (hrv/spo2/weight) ni readiness ni otras métricas del día.

// Sub-objetos normalizados que escribimos en metrics.* (clave -> valor)
interface NormalizedSleep {
  total?: number;
  deep?: number;
  rem?: number;
  core?: number;
  awake?: number;
  sleepStart?: string;
  sleepEnd?: string;
  source?: string;
}
interface NormalizedHeartRate {
  min?: number;
  max?: number;
  avg?: number;
  source?: string;
}
interface NormalizedSteps {
  qty?: number;
  source?: string;
}
interface NormalizedActiveEnergy {
  kcal?: number;
  source?: string;
}

// Parcial acumulado por día: solo las métricas que realmente llegan.
interface DayMetrics {
  sleep?: NormalizedSleep;
  heartRate?: NormalizedHeartRate;
  steps?: NormalizedSteps;
  activeEnergy?: NormalizedActiveEnergy;
}

type DataPoint = Record<string, unknown>;

// Helpers defensivos: HAE mezcla mayúsculas (heart_rate -> Min/Max/Avg;
// step_count/active_energy -> qty). Probamos varias variantes de la misma clave.
function num(point: DataPoint, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = point[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return undefined;
}

function str(point: DataPoint, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = point[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return undefined;
}

// El día = primeros 10 caracteres del campo `date` ("YYYY-MM-DD"), sin tocar zonas.
function dayOf(point: DataPoint): string | undefined {
  const raw = str(point, 'date');
  if (!raw || raw.length < 10) return undefined;
  return raw.slice(0, 10);
}

const round1 = (n: number): number => Math.round(n * 10) / 10;

// active_energy llega normalmente en kJ: si units es kJ, convertimos a kcal
// (÷4.184); si ya es kcal/Cal, lo dejamos. Resultado redondeado a 1 decimal.
function toKcal(value: number, units: string | undefined): number {
  const u = (units ?? '').trim().toLowerCase();
  if (u === 'kj') return round1(value / 4.184);
  return round1(value);
}

// Inserta el parcial de una métrica en el mapa por día.
function accumulate(
  map: Map<string, DayMetrics>,
  day: string,
  patch: Partial<DayMetrics>,
): void {
  const existing = map.get(day) ?? {};
  map.set(day, { ...existing, ...patch });
}

export async function ingestHealthPayload(
  userId: string,
  payload: SyncPayload,
): Promise<{ days: string[]; metricsByDay: Record<string, string[]> }> {
  const byDay = new Map<string, DayMetrics>();

  for (const metric of payload.data.metrics) {
    const { name, units, data } = metric;

    for (const point of data) {
      const day = dayOf(point);
      if (!day) continue; // sin fecha utilizable: lo ignoramos

      const source = str(point, 'source');

      switch (name) {
        case 'step_count': {
          const qty = num(point, 'qty', 'Qty');
          if (qty === undefined) break;
          accumulate(byDay, day, { steps: { qty, source } });
          break;
        }

        case 'active_energy': {
          const raw = num(point, 'qty', 'Qty');
          if (raw === undefined) break;
          accumulate(byDay, day, { activeEnergy: { kcal: toKcal(raw, units), source } });
          break;
        }

        case 'heart_rate': {
          const min = num(point, 'Min', 'min');
          const max = num(point, 'Max', 'max');
          const avg = num(point, 'Avg', 'avg');
          if (min === undefined && max === undefined && avg === undefined) break;
          accumulate(byDay, day, { heartRate: { min, max, avg, source } });
          break;
        }

        case 'sleep_analysis': {
          const total = num(point, 'totalSleep', 'TotalSleep', 'total');
          const deep = num(point, 'deep', 'Deep');
          const rem = num(point, 'rem', 'REM', 'Rem');
          const core = num(point, 'core', 'Core');
          const awake = num(point, 'awake', 'Awake');
          const sleepStart = str(point, 'sleepStart', 'SleepStart');
          const sleepEnd = str(point, 'sleepEnd', 'SleepEnd');
          const hasAny =
            total !== undefined ||
            deep !== undefined ||
            rem !== undefined ||
            core !== undefined ||
            awake !== undefined;
          if (!hasAny) break;
          accumulate(byDay, day, {
            sleep: { total, deep, rem, core, awake, sleepStart, sleepEnd, source },
          });
          break;
        }

        default:
          // name desconocido: ignorar sin romper.
          break;
      }
    }
  }

  const metricsByDay: Record<string, string[]> = {};

  // Upsert idempotente por día: $set dinámico SOLO con las métricas presentes,
  // para no pisar campos manuales ni métricas previas del mismo día.
  for (const [date, dayMetrics] of byDay) {
    const set: Record<string, unknown> = {};
    const present: string[] = [];

    if (dayMetrics.sleep) {
      set['metrics.sleep'] = dayMetrics.sleep;
      present.push('sleep');
    }
    if (dayMetrics.heartRate) {
      set['metrics.heartRate'] = dayMetrics.heartRate;
      present.push('heartRate');
    }
    if (dayMetrics.steps) {
      set['metrics.steps'] = dayMetrics.steps;
      present.push('steps');
    }
    if (dayMetrics.activeEnergy) {
      set['metrics.activeEnergy'] = dayMetrics.activeEnergy;
      present.push('activeEnergy');
    }

    if (present.length === 0) continue;

    await DailyMetrics.updateOne(
      { userId, date },
      { $set: set, $setOnInsert: { userId, date } },
      { upsert: true },
    );

    metricsByDay[date] = present;
  }

  const days = Object.keys(metricsByDay).sort();
  return { days, metricsByDay };
}
