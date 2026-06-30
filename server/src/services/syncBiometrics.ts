import { DailyMetrics } from '../models/DailyMetrics.js';
import type { SyncPayload } from '../validation/sync.schema.js';

// Ingesta de biometría del Atajo de iOS (Health Auto Export v2).
// Parsea el payload heterogéneo, normaliza por métrica y upserta un documento
// diario por (userId, date) MERGEANDO solo las métricas presentes, sin pisar
// readiness ni otras métricas del día. El peso (weight_body_mass) SÍ entra por
// sync, pero con precedencia "manual gana" (no pisa un peso de origen manual);
// los demás campos manuales (hrv/spo2) siguen sin tocarse.

// Muestras intradía (una por hora). `t` es la hora local "HH:00".
interface HeartRateSample {
  t: string;
  min?: number;
  avg?: number;
  max?: number;
}
interface StepsHour {
  t: string;
  qty: number;
}
interface ActiveEnergyHour {
  t: string;
  kcal: number;
}

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
  samples?: HeartRateSample[];
}
interface NormalizedSteps {
  qty?: number;
  source?: string;
  hourly?: StepsHour[];
}
interface NormalizedActiveEnergy {
  kcal?: number;
  source?: string;
  hourly?: ActiveEnergyHour[];
}
interface NormalizedWeight {
  kg?: number;
  source?: string;
}

// Acumuladores por día: recogen todos los puntos horarios antes de agregar.
// Mapa hora ("HH:00") -> muestra, para colapsar horas repetidas de forma
// determinista (ver reglas de colisión en ingestHealthPayload).
interface DayAccumulator {
  sleep?: NormalizedSleep;
  steps?: {
    source?: string;
    byHour: Map<string, number>; // hora -> pasos del tramo (sumados si repite)
    noHourTotal: number; // suma de puntos sin hora válida (formato diario/raro)
  };
  activeEnergy?: {
    source?: string;
    byHour: Map<string, number>; // hora -> kcal del tramo (sumados si repite)
    noHourTotal: number; // suma de puntos sin hora válida (formato diario/raro)
  };
  heartRate?: {
    source?: string;
    byHour: Map<string, HeartRateSample>; // hora -> última muestra (ver colisión)
    mins: number[]; // todos los Min del día (con y sin hora) para el agregado
    maxs: number[];
    avgs: number[];
  };
  weight?: {
    // El peso es un ESCALAR por día (no horario ni aditivo). Si hay varias
    // lecturas el mismo día, nos quedamos con la ÚLTIMA (la de hora más tardía).
    kg: number;
    source?: string;
    raw: string; // `date` crudo de la lectura elegida, para comparar "más reciente"
  };
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

// La hora local = caracteres 11-12 del campo `date` ("YYYY-MM-DD HH:mm:ss ±ZZZZ").
// Devuelve "HH:00" si la hora es un entero válido 00-23; si no, undefined
// (el punto se contará igualmente en el agregado diario, pero no en la serie).
function hourOf(point: DataPoint): string | undefined {
  const raw = str(point, 'date');
  if (!raw || raw.length < 13) return undefined;
  const hh = raw.slice(11, 13);
  if (!/^\d{2}$/.test(hh)) return undefined;
  const n = Number(hh);
  if (n < 0 || n > 23) return undefined;
  return `${hh}:00`;
}

const round1 = (n: number): number => Math.round(n * 10) / 10;

// active_energy llega normalmente en kJ: si units es kJ, convertimos a kcal
// (÷4.184); si ya es kcal/Cal, lo dejamos. Resultado redondeado a 1 decimal.
function toKcal(value: number, units: string | undefined): number {
  const u = (units ?? '').trim().toLowerCase();
  if (u === 'kj') return round1(value / 4.184);
  return round1(value);
}

// Obtiene (o crea) el acumulador de un día.
function dayAcc(map: Map<string, DayAccumulator>, day: string): DayAccumulator {
  let acc = map.get(day);
  if (!acc) {
    acc = {};
    map.set(day, acc);
  }
  return acc;
}

export async function ingestHealthPayload(
  userId: string,
  payload: SyncPayload,
): Promise<{ days: string[]; metricsByDay: Record<string, string[]> }> {
  // Fase 1 — acumular: recorremos todos los puntos y agrupamos por día y hora.
  const byDay = new Map<string, DayAccumulator>();

  for (const metric of payload.data.metrics) {
    const { name, units, data } = metric;

    for (const point of data) {
      const day = dayOf(point);
      if (!day) continue; // sin fecha utilizable: lo ignoramos

      const hour = hourOf(point); // "HH:00" o undefined (formato diario/raro)
      const source = str(point, 'source');
      const acc = dayAcc(byDay, day);

      switch (name) {
        case 'step_count': {
          const qty = num(point, 'qty', 'Qty');
          if (qty === undefined) break;
          if (!acc.steps) {
            acc.steps = { byHour: new Map(), noHourTotal: 0 };
          }
          // Source: nos quedamos con la primera no vacía vista en el día.
          if (acc.steps.source === undefined && source !== undefined) acc.steps.source = source;
          if (hour) {
            // Colisión de hora (no esperada con agregación horaria): SUMAMOS,
            // porque los pasos de un mismo tramo son aditivos.
            acc.steps.byHour.set(hour, (acc.steps.byHour.get(hour) ?? 0) + qty);
          } else {
            // Sin hora válida: cuenta en el total diario pero no en la serie.
            acc.steps.noHourTotal += qty;
          }
          break;
        }

        case 'active_energy': {
          const raw = num(point, 'qty', 'Qty');
          if (raw === undefined) break;
          const kcal = toKcal(raw, units);
          if (!acc.activeEnergy) {
            acc.activeEnergy = { byHour: new Map(), noHourTotal: 0 };
          }
          if (acc.activeEnergy.source === undefined && source !== undefined) {
            acc.activeEnergy.source = source;
          }
          if (hour) {
            // Colisión de hora: SUMAMOS (la energía de un tramo es aditiva).
            acc.activeEnergy.byHour.set(hour, (acc.activeEnergy.byHour.get(hour) ?? 0) + kcal);
          } else {
            // Sin hora válida: cuenta en el total diario pero no en la serie.
            acc.activeEnergy.noHourTotal += kcal;
          }
          break;
        }

        case 'heart_rate': {
          const min = num(point, 'Min', 'min');
          const max = num(point, 'Max', 'max');
          const avg = num(point, 'Avg', 'avg');
          if (min === undefined && max === undefined && avg === undefined) break;
          if (!acc.heartRate) {
            acc.heartRate = { byHour: new Map(), mins: [], maxs: [], avgs: [] };
          }
          if (acc.heartRate.source === undefined && source !== undefined) {
            acc.heartRate.source = source;
          }
          // Agregados diarios: recogemos todos los valores (con y sin hora).
          if (min !== undefined) acc.heartRate.mins.push(min);
          if (max !== undefined) acc.heartRate.maxs.push(max);
          if (avg !== undefined) acc.heartRate.avgs.push(avg);
          if (hour) {
            // Colisión de hora (no esperada): nos quedamos con la ÚLTIMA muestra
            // vista; la FC no es aditiva, así que sumar no tiene sentido.
            acc.heartRate.byHour.set(hour, { t: hour, min, avg, max });
          }
          break;
        }

        case 'sleep_analysis': {
          // El sueño NO es horario: 1 punto por día, campos directos.
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
          acc.sleep = { total, deep, rem, core, awake, sleepStart, sleepEnd, source };
          break;
        }

        case 'weight_body_mass': {
          // Peso corporal: escalar por día en kg (no se convierte, no es aditivo).
          const kg = num(point, 'qty', 'Qty');
          if (kg === undefined) break;
          const raw = str(point, 'date');
          if (!raw) break; // sin marca temporal no podemos resolver "el más reciente"
          // Nos quedamos con la lectura de hora más tardía del día (comparación
          // lexicográfica del `date` crudo: comparten formato "YYYY-MM-DD HH:mm:ss").
          if (!acc.weight || raw >= acc.weight.raw) {
            acc.weight = { kg, source, raw };
          }
          break;
        }

        default:
          // name desconocido: ignorar sin romper.
          break;
      }
    }
  }

  // Fase 2 — agregar y persistir por día.
  const metricsByDay: Record<string, string[]> = {};

  for (const [date, acc] of byDay) {
    const set: Record<string, unknown> = {};
    const present: string[] = [];

    if (acc.sleep) {
      set['metrics.sleep'] = acc.sleep;
      present.push('sleep');
    }

    if (acc.steps) {
      // Serie ordenada por hora ascendente; pasos a entero (tramo y total).
      const hourly: StepsHour[] = [...acc.steps.byHour.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([t, qty]) => ({ t, qty: Math.round(qty) }));
      // Total diario = suma de los tramos YA redondeados + los puntos sin hora
      // (también redondeados). Así el total cuadra SIEMPRE con la serie que ve el
      // usuario, sin descuadres por redondear la suma cruda por separado.
      const dailyQty =
        hourly.reduce((s, h) => s + h.qty, 0) + Math.round(acc.steps.noHourTotal);
      const steps: NormalizedSteps = { qty: dailyQty, source: acc.steps.source };
      if (hourly.length > 0) steps.hourly = hourly;
      set['metrics.steps'] = steps;
      present.push('steps');
    }

    if (acc.activeEnergy) {
      // kcal a 1 decimal (tramo y total).
      const hourly: ActiveEnergyHour[] = [...acc.activeEnergy.byHour.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([t, kcal]) => ({ t, kcal: round1(kcal) }));
      // Total diario = suma de los tramos YA redondeados + puntos sin hora,
      // redondeada a 1 decimal (coherente con la serie, ver pasos).
      const dailyKcal = round1(
        hourly.reduce((s, h) => s + h.kcal, 0) + acc.activeEnergy.noHourTotal,
      );
      const activeEnergy: NormalizedActiveEnergy = {
        kcal: dailyKcal,
        source: acc.activeEnergy.source,
      };
      if (hourly.length > 0) activeEnergy.hourly = hourly;
      set['metrics.activeEnergy'] = activeEnergy;
      present.push('activeEnergy');
    }

    if (acc.heartRate) {
      const samples: HeartRateSample[] = [...acc.heartRate.byHour.values()].sort((a, b) =>
        a.t.localeCompare(b.t),
      );
      // Agregados: min = mínimo de los Min, max = máximo de los Max,
      // avg = media simple de los Avg (a 1 decimal).
      const heartRate: NormalizedHeartRate = { source: acc.heartRate.source };
      if (acc.heartRate.mins.length > 0) heartRate.min = Math.min(...acc.heartRate.mins);
      if (acc.heartRate.maxs.length > 0) heartRate.max = Math.max(...acc.heartRate.maxs);
      if (acc.heartRate.avgs.length > 0) {
        heartRate.avg = round1(
          acc.heartRate.avgs.reduce((s, v) => s + v, 0) / acc.heartRate.avgs.length,
        );
      }
      if (samples.length > 0) heartRate.samples = samples;
      set['metrics.heartRate'] = heartRate;
      present.push('heartRate');
    }

    // El peso NO va en el $set masivo: tiene precedencia "manual gana" y se
    // persiste aparte con un filtro condicional (ver bloque tras el upsert).
    const hasWeight = acc.weight !== undefined;

    if (present.length === 0 && !hasWeight) continue;

    // Upsert idempotente por día: $set dinámico SOLO con las métricas presentes.
    // Cada métrica se REEMPLAZA por completo (incluida su serie), de modo que
    // reenviar el mismo día actualiza las horas sin duplicarlas ni acumular.
    // No tocamos campos manuales (hrv/spo2) ni readiness ni métricas ausentes en
    // este payload. El peso se persiste aparte (ver bloque siguiente).
    if (present.length > 0) {
      await DailyMetrics.updateOne(
        { userId, date },
        { $set: set, $setOnInsert: { userId, date } },
        { upsert: true },
      );
    }

    // Peso: precedencia "manual gana". Convención de `source`:
    //   - sync   -> string crudo de HAE (p. ej. "Salud", "KSIX Ring").
    //   - manual -> el literal 'manual' (lo escribirá la entrada manual, otra tanda).
    // El sync solo escribe el peso si el día NO tiene ya un peso manual.
    // No usamos upsert con filtro sobre `metrics.weight.source` porque, si el día
    // tuviera peso manual, el filtro no casaría y el upsert intentaría INSERTAR un
    // doc duplicado (choque con el índice único userId+date). En su lugar:
    //   1) intentamos actualizar el doc del día si NO tiene peso manual;
    //   2) si no se actualizó nada Y el día no existe, lo creamos (upsert separado).
    // Idempotente: reenviar el mismo peso de sync reescribe el mismo valor; un peso
    // manual preexistente nunca se pisa.
    if (acc.weight) {
      const weight: NormalizedWeight = { kg: round1(acc.weight.kg), source: acc.weight.source };
      const res = await DailyMetrics.updateOne(
        { userId, date, 'metrics.weight.source': { $ne: 'manual' } },
        { $set: { 'metrics.weight': weight } },
      );
      // matchedCount 0 => o no existe el día, o existe con peso manual.
      // Solo creamos el día si NO existe (un día con peso manual no se toca).
      if (res.matchedCount === 0) {
        await DailyMetrics.updateOne(
          { userId, date },
          { $setOnInsert: { userId, date, 'metrics.weight': weight } },
          { upsert: true },
        );
      }
      present.push('weight');
    }

    metricsByDay[date] = present;
  }

  const days = Object.keys(metricsByDay).sort();
  return { days, metricsByDay };
}
