import { clamp, linMap, round } from './helpers.js';
import { zScore } from './baseline.js';
import type { Baselines, DayInput, StressComponents, StressResult, StressState } from './types.js';

// Estrés (0–100) como PROXY (no lo medimos directamente, lo inferimos). Pesos:
//   autonómico 0.5 · deuda de sueño 0.3 · RHR elevada 0.2
// `confidence` SIEMPRE 'proxy' para que la UI/IA no lo trate como medición dura.

const W = { autonomic: 0.5, sleepDebt: 0.3, rhrElev: 0.2 } as const;

interface WeightedComponent {
  value: number;
  weight: number;
}

function toState(score: number): StressState {
  if (score >= 66) return 'high';
  if (score >= 33) return 'moderate';
  return 'low';
}

/**
 * Calcula el estrés proxy del día. `sleepScore` es la calidad de sueño ya
 * calculada (o `null`). Devuelve `null` si no queda ningún componente con dato.
 */
export function computeStress(
  today: DayInput,
  baselines: Baselines,
  sleepScore: number | null,
): StressResult | null {
  const hr = today.metrics?.heartRate;
  const components: StressComponents = {};
  const weighted: WeightedComponent[] = [];

  // --- Autonómico: cuánto se separa la FC media de la de reposo (avg/min) ---
  if (hr?.avg != null && hr.min != null && hr.min > 0) {
    const ratio = hr.avg / hr.min;
    const autonomic = clamp(linMap(ratio, 1.1, 1.8, 0, 100), 0, 100);
    components.autonomic = round(autonomic, 1);
    weighted.push({ value: autonomic, weight: W.autonomic });
  }

  // --- Deuda de sueño: lo contrario a la calidad de sueño ---
  if (sleepScore != null) {
    const sleepDebt = clamp(100 - sleepScore, 0, 100);
    components.sleepDebt = round(sleepDebt, 1);
    weighted.push({ value: sleepDebt, weight: W.sleepDebt });
  }

  // --- RHR elevada vs tu media: por encima de tu baseline = más estrés ---
  if (baselines.rhr.n >= 1 && hr?.min != null) {
    const z = zScore(hr.min, baselines.rhr);
    const rhrElev = clamp(50 + z * 25, 0, 100);
    components.rhrElev = round(rhrElev, 1);
    weighted.push({ value: rhrElev, weight: W.rhrElev });
  }

  if (weighted.length === 0) return null;

  let totalWeight = 0;
  for (const c of weighted) totalWeight += c.weight;
  let acc = 0;
  for (const c of weighted) acc += c.value * (c.weight / totalWeight);

  const score = round(clamp(acc, 0, 100));

  return { score, state: toState(score), confidence: 'proxy', components };
}
