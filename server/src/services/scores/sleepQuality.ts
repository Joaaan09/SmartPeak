import { clamp, linMap, round } from './helpers.js';
import type { SleepInput, SleepQualityResult, SleepState } from './types.js';

// Calidad del sueño (0–100) a partir de las fases. Ponderación FIJA:
//   duración 0.40 · reparador 0.30 · eficiencia 0.20 · continuidad 0.10
// Todas las horas vienen en decimal (6.9 = 6h54m), `awake` también.

/** Sub-score de duración: zona ideal [7.5, 9] h → 100. */
function durationScore(total: number): number {
  if (total >= 7.5 && total <= 9) return 100;
  if (total < 4) return linMap(total, 0, 4, 0, 30);
  if (total < 7.5) return linMap(total, 4, 7.5, 30, 100);
  // total > 9: dormir de más penaliza suave, sin bajar de 85.
  return clamp(100 - (total - 9) * 10, 85, 100);
}

/** Penaliza por distancia (en puntos %) al borde más cercano de [lo, hi]. */
function phaseScore(pct: number, lo: number, hi: number): number {
  if (pct >= lo && pct <= hi) return 100;
  const dist = pct < lo ? lo - pct : pct - hi;
  return clamp(100 - dist * 4, 0, 100);
}

/**
 * Sub-score reparador: combina % de sueño profundo (deep, ideal [13,23]) y REM
 * (ideal [20,25]). Si faltan deep o rem → neutral 60 (no penalizamos por una
 * ausencia que no controlamos).
 */
function restorativeScore(sleep: SleepInput, total: number): number {
  if (sleep.deep == null || sleep.rem == null) return 60;
  const deepPct = (sleep.deep / total) * 100;
  const remPct = (sleep.rem / total) * 100;
  const deepScore = phaseScore(deepPct, 13, 23);
  const remScore = phaseScore(remPct, 20, 25);
  return (deepScore + remScore) / 2;
}

/** Sub-score de eficiencia: tiempo dormido / tiempo en cama. */
function efficiencyScore(sleep: SleepInput, total: number): number {
  const awake = sleep.awake;
  // Sin tiempo despierto registrado → eficiencia perfecta.
  if (awake == null || awake <= 0) return 100;
  const eff = (total / (total + awake)) * 100;
  if (eff >= 90) return 100;
  return linMap(eff, 75, 90, 40, 100);
}

/** Sub-score de continuidad: penaliza el tiempo despierto en horas. */
function continuityScore(sleep: SleepInput): number {
  const awake = sleep.awake;
  if (awake == null || awake <= 0.33) return 100;
  return linMap(awake, 0.33, 1.5, 100, 40);
}

function toState(score: number): SleepState {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

/**
 * Calcula la calidad del sueño. Devuelve `null` si no hay `total` (sin duración
 * no hay nada que puntuar).
 */
export function computeSleepQuality(sleep: SleepInput | undefined): SleepQualityResult | null {
  // Sin total, no finito o <= 0 → ausencia de sueño (no es un sueño "poor" de 0 h).
  if (sleep == null || sleep.total == null || !Number.isFinite(sleep.total) || sleep.total <= 0) {
    return null;
  }
  const total = sleep.total;

  const duration = durationScore(total);
  const restorative = restorativeScore(sleep, total);
  const efficiency = efficiencyScore(sleep, total);
  const continuity = continuityScore(sleep);

  const raw = 0.4 * duration + 0.3 * restorative + 0.2 * efficiency + 0.1 * continuity;
  const score = round(clamp(raw, 0, 100));

  return {
    score,
    state: toState(score),
    components: {
      durationScore: round(duration, 1),
      restorativeScore: round(restorative, 1),
      efficiencyScore: round(efficiency, 1),
      continuityScore: round(continuity, 1),
    },
  };
}
