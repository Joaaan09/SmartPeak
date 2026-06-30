import { computeBaseline } from './baseline.js';
import { mean } from './helpers.js';
import { computeSleepQuality } from './sleepQuality.js';
import { computeReadiness } from './readiness.js';
import { computeStrain } from './strain.js';
import { computeEnergyLevel } from './energyLevel.js';
import { computeStress } from './stress.js';
import type { Baselines, DailyScores, DayInput, UserInput } from './types.js';

// Orquestador del motor de scores. PURO: recibe el día de hoy + el histórico ya
// cargado (docs previos, SIN el de hoy) + el usuario, y devuelve los 5 scores.
// No accede a la BD ni lanza excepciones por datos ausentes: degrada a `null`.

const FALLBACK_AGE = 30;

/**
 * Edad del usuario en años. Prioriza `user.age` (override); si no, deriva de
 * `birthDate` (campo real del modelo User). Fallback a 30 si no hay nada usable.
 */
function deriveAge(user: UserInput): number {
  if (user.age != null && Number.isFinite(user.age) && user.age > 0) {
    return user.age;
  }
  if (user.birthDate != null) {
    const dob = user.birthDate instanceof Date ? user.birthDate : new Date(user.birthDate);
    if (!Number.isNaN(dob.getTime())) {
      const now = new Date();
      let age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
      if (age > 0 && age < 130) return age;
    }
  }
  return FALLBACK_AGE;
}

/** kcal activas de un día (o `undefined`). */
function selectKcal(day: DayInput): number | undefined {
  return day.metrics?.activeEnergy?.kcal;
}

/**
 * Calcula los baselines desde el histórico (ya ordenado de más reciente a más
 * antiguo NO es obligatorio: para acute/chronic usamos el índice por antigüedad,
 * así que asumimos `history` ordenado de MÁS RECIENTE a MÁS ANTIGUO; ver nota).
 *
 * Convención de orden: `history[0]` es el día más reciente (ayer), `history[1]`
 * anteayer, etc. El caller (orquestador real en otra subtarea) debe respetarlo.
 *
 * - `energyAcute`: media de kcal de los ÚLTIMOS 3 días del histórico (índices
 *   0..2). NO incluye hoy: el día de hoy suele estar incompleto (sync intradía),
 *   así que medir la carga aguda solo con días cerrados es más estable.
 * - `energyChronic`: media de kcal de los días [4..28] hacia atrás (índices
 *   3..27, 0-based), la línea de base de las últimas ~4 semanas.
 */
function buildBaselines(history: DayInput[]): Baselines {
  const rhr = computeBaseline(history, (d) => d.metrics?.heartRate?.min);
  const hrv = computeBaseline(history, (d) => d.metrics?.hrv?.value);

  // Media global de kcal del histórico (referencia de strain).
  const allKcal: number[] = [];
  for (const d of history) {
    const k = selectKcal(d);
    if (k != null && Number.isFinite(k)) allKcal.push(k);
  }
  const energyMean = mean(allKcal);

  // Aguda: últimos 3 días cerrados (índices 0..2).
  const acuteKcal: number[] = [];
  for (let i = 0; i < Math.min(3, history.length); i += 1) {
    const day = history[i];
    const k = day ? selectKcal(day) : undefined;
    if (k != null && Number.isFinite(k)) acuteKcal.push(k);
  }
  const energyAcute = mean(acuteKcal);

  // Crónica: días [4..28] hacia atrás → índices 3..27 (0-based).
  const chronicKcal: number[] = [];
  for (let i = 3; i < Math.min(28, history.length); i += 1) {
    const day = history[i];
    const k = day ? selectKcal(day) : undefined;
    if (k != null && Number.isFinite(k)) chronicKcal.push(k);
  }
  const energyChronic = mean(chronicKcal);

  return { rhr, hrv, energyMean, energyAcute, energyChronic };
}

/**
 * Calcula todos los scores del día. `history` son los docs previos (SIN el de
 * hoy), ordenados de más reciente a más antiguo. Cada campo del resultado es
 * `null` cuando faltan datos imprescindibles para ese score.
 */
export function computeDailyScores(
  today: DayInput,
  history: DayInput[],
  user: UserInput,
): DailyScores {
  const age = deriveAge(user);
  const baselines = buildBaselines(history);

  // Orden: sleep → readiness → strain → energy (depende de readiness+strain) → stress.
  const sleepQuality = computeSleepQuality(today.metrics?.sleep);
  const sleepScore = sleepQuality?.score ?? null;

  const readiness = computeReadiness(today, baselines, sleepScore);
  const strain = computeStrain(today, baselines, age);
  const energy = computeEnergyLevel(readiness?.score ?? null, strain?.score ?? null);
  const stress = computeStress(today, baselines, sleepScore);

  return { sleepQuality, readiness, strain, energy, stress };
}

// Re-export de la superficie pública del motor (tipos + helpers reutilizables).
export type {
  Baseline,
  Baselines,
  DailyScores,
  DayInput,
  MetricsInput,
  SleepQualityResult,
  ReadinessResult,
  StrainResult,
  EnergyLevelResult,
  StressResult,
  UserInput,
} from './types.js';
export { computeBaseline, zScore } from './baseline.js';
export { clamp, linMap, round } from './helpers.js';
