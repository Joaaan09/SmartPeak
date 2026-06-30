import type { Baseline, DayInput } from './types.js';

// Baselines del histórico: media, desviación y nº de observaciones de una
// métrica concreta. El caller (orquestador) ya limita la ventana a 30–60 días;
// aquí usamos TODO lo que se reciba.

/** Selector que extrae el valor de una métrica de un día (o `undefined`). */
export type MetricSelector = (day: DayInput) => number | undefined;

/**
 * Calcula la baseline de una métrica sobre `history` (NO debe incluir el día de
 * hoy). Aplica `selector` a cada doc, descarta nulos / no finitos y devuelve
 * `{ mean, sd, n }`.
 *
 * `sd` es la desviación típica MUESTRAL (n-1, corrección de Bessel): el
 * histórico es una muestra del comportamiento del usuario, no la población
 * completa, y la usamos para z-scores. Con n < 2 no hay dispersión estimable,
 * así que `sd = 0` (y `zScore` lo trata como neutro).
 */
export function computeBaseline(history: DayInput[], selector: MetricSelector): Baseline {
  const values: number[] = [];
  for (const day of history) {
    const v = selector(day);
    if (v != null && Number.isFinite(v)) values.push(v);
  }

  const n = values.length;
  if (n === 0) return { mean: 0, sd: 0, n: 0 };

  let sum = 0;
  for (const v of values) sum += v;
  const mean = sum / n;

  if (n < 2) return { mean, sd: 0, n };

  let sqSum = 0;
  for (const v of values) {
    const d = v - mean;
    sqSum += d * d;
  }
  const sd = Math.sqrt(sqSum / (n - 1)); // muestral (n-1)

  return { mean, sd, n };
}

/**
 * Z-score de `value` respecto a una baseline. Guarda dura: `sd === 0` (o n
 * insuficiente) → 0, para no amplificar ruido cuando no hay dispersión.
 */
export function zScore(value: number, baseline: Pick<Baseline, 'mean' | 'sd'>): number {
  if (baseline.sd === 0) return 0;
  return (value - baseline.mean) / baseline.sd;
}
