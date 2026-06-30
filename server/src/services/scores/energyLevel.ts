import { clamp, round } from './helpers.js';
import type { EnergyLevelResult, EnergyState } from './types.js';

// Nivel de energía (0–100): combinación de readiness (recuperación) y el
// "descanso" respecto al strain (cuánta carga te queda sin gastar).
//   energía = 0.6 * readiness + 0.4 * (100 - strain)

function toState(score: number): EnergyState {
  if (score >= 66) return 'high';
  if (score >= 33) return 'medium';
  return 'low';
}

/**
 * Calcula el nivel de energía. Requiere readiness Y strain; si falta alguno
 * devuelve `null` (es un score derivado, no tiene sentido sin sus dos fuentes).
 */
export function computeEnergyLevel(
  readinessScore: number | null,
  strainScore: number | null,
): EnergyLevelResult | null {
  if (readinessScore == null || strainScore == null) return null;
  const score = clamp(round(0.6 * readinessScore + 0.4 * (100 - strainScore)), 0, 100);
  return { score, state: toState(score) };
}
