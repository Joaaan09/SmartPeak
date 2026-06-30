import { clamp, round } from './helpers.js';
import { zScore } from './baseline.js';
import type {
  Baselines,
  Confidence,
  DayInput,
  ReadinessComponents,
  ReadinessResult,
  ReadinessState,
} from './types.js';

// Readiness (0–100): cuán recuperado está el usuario hoy. Pesos BASE:
//   sueño 0.35 · RHR 0.30 · HRV 0.20 · carga 0.15
// Cada componente solo entra si hay dato; al final se RENORMALIZAN los pesos de
// los presentes a suma 1 (un día sin HRV no infla artificialmente el resto).

const W = { sleep: 0.35, rhr: 0.3, hrv: 0.2, load: 0.15 } as const;

/** Par (valor, peso) de un componente; peso 0 = ausente, no cuenta. */
interface WeightedComponent {
  value: number;
  weight: number;
}

function toState(score: number): ReadinessState {
  if (score >= 75) return 'recovered';
  if (score >= 50) return 'moderate';
  return 'fatigue';
}

function toConfidence(rhrN: number): Confidence {
  if (rhrN >= 14) return 'high';
  if (rhrN >= 7) return 'medium';
  return 'low';
}

/**
 * Calcula readiness. `sleepScore` es el score de calidad de sueño ya calculado
 * (o `null` si no hubo sueño). Devuelve `null` si no queda NINGÚN componente con
 * dato (sin sueño, sin baseline de RHR, sin HRV y sin carga crónica).
 */
export function computeReadiness(
  today: DayInput,
  baselines: Baselines,
  sleepScore: number | null,
): ReadinessResult | null {
  const hr = today.metrics?.heartRate;
  const components: ReadinessComponents = {};
  const weighted: WeightedComponent[] = [];

  // --- Sueño ---
  if (sleepScore != null) {
    components.sleep = round(sleepScore, 1);
    weighted.push({ value: sleepScore, weight: W.sleep });
  }

  // --- RHR (FC reposo, proxy heartRate.min): más baja vs tu media = mejor ---
  if (baselines.rhr.n >= 1 && hr?.min != null) {
    const z = zScore(hr.min, baselines.rhr);
    const rhrComp = clamp(75 - z * 25, 40, 100);
    components.rhr = round(rhrComp, 1);
    weighted.push({ value: rhrComp, weight: W.rhr });
  }

  // --- HRV: solo si hay dato manual hoy y baseline; más alta = mejor ---
  const hrv = today.metrics?.hrv?.value;
  if (hrv != null && baselines.hrv.n >= 1) {
    const z = zScore(hrv, baselines.hrv);
    const hrvComp = clamp(75 + z * 25, 40, 100);
    components.hrv = round(hrvComp, 1);
    weighted.push({ value: hrvComp, weight: W.hrv });
  }

  // --- Carga (aguda vs crónica): sobrecarga reciente baja la readiness ---
  const { energyAcute, energyChronic } = baselines;
  if (energyAcute != null && energyChronic != null && energyChronic > 0) {
    const ratio = energyAcute / energyChronic;
    const loadComp = clamp(100 - Math.max(0, ratio - 1) * 80, 20, 100);
    components.load = round(loadComp, 1);
    weighted.push({ value: loadComp, weight: W.load });
  } else if (energyAcute != null) {
    // Hay carga aguda pero no crónica (histórico corto): neutral 75 a mitad de peso.
    const loadComp = 75;
    components.load = loadComp;
    weighted.push({ value: loadComp, weight: W.load / 2 });
  }

  if (weighted.length === 0) return null;

  // Renormaliza los pesos presentes a suma 1 y combina.
  let totalWeight = 0;
  for (const c of weighted) totalWeight += c.weight;
  let acc = 0;
  for (const c of weighted) acc += c.value * (c.weight / totalWeight);

  const score = round(clamp(acc, 0, 100));

  return {
    score,
    state: toState(score),
    confidence: toConfidence(baselines.rhr.n),
    components,
  };
}
