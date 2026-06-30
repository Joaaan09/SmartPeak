import { clamp, linMap, round } from './helpers.js';
import type { Baselines, DayInput, StrainComponents, StrainResult, StrainState } from './types.js';

// Strain (0–100): carga cardiovascular y metabólica del día. Pesos BASE:
//   energía 0.45 · cardio 0.40 · pasos 0.15
// Si falta el componente cardio (sin samples de FC), se renormaliza el resto.

const W = { energy: 0.45, cardio: 0.4, steps: 0.15 } as const;

interface WeightedComponent {
  value: number;
  weight: number;
}

/**
 * Sub-score de energía: kcal activas relativas a tu media histórica
 * (media → 50, doble de la media → 100). Sin media → referencia absoluta
 * (0–1000 kcal → 0–100).
 */
function energyComp(today: DayInput, energyMean: number | undefined): number | null {
  const kcal = today.metrics?.activeEnergy?.kcal;
  if (kcal == null) return null;
  if (energyMean != null && energyMean > 0) {
    const ratio = kcal / energyMean;
    return clamp(linMap(ratio, 0, 2, 0, 100), 0, 100);
  }
  return clamp(linMap(kcal, 0, 1000, 0, 100), 0, 100);
}

/**
 * Sub-score cardio a partir de la serie horaria de FC. Para cada muestra con
 * `avg`, clasifica por %FCmax en zonas 1..5 y suma el peso de la zona (z1=1 …
 * z5=5). Normaliza con un techo de `5 * nMuestras * 0.6`:
 *
 *   ¿Por qué 0.6? El máximo teórico (todas las muestras en zona 5, peso 5) es
 *   irreal para un día completo (incluye horas en reposo). Fijar el techo al
 *   60% de ese máximo hace que un día MUY activo —p. ej. promedio de zona 3 con
 *   picos altos— ronde los 100, sin necesitar un día imposible al 100% en z5.
 *
 * Sin samples → proxy débil con la amplitud (avg - min) o `null` si no hay datos.
 */
function cardioComp(today: DayInput, age: number): number | null {
  const hr = today.metrics?.heartRate;
  const fcMax = 208 - 0.7 * age;

  const samples = hr?.samples;
  if (samples && samples.length > 0) {
    let cardioRaw = 0;
    let counted = 0;
    for (const s of samples) {
      if (s.avg == null) continue;
      counted += 1;
      const pct = (s.avg / fcMax) * 100;
      let zoneWeight: number;
      if (pct < 60) zoneWeight = 1;
      else if (pct < 70) zoneWeight = 2;
      else if (pct < 80) zoneWeight = 3;
      else if (pct < 90) zoneWeight = 4;
      else zoneWeight = 5;
      cardioRaw += zoneWeight;
    }
    if (counted === 0) return null;
    const ceiling = 5 * counted * 0.6;
    return clamp(linMap(cardioRaw, 0, ceiling, 0, 100), 0, 100);
  }

  // Sin serie: proxy débil con la amplitud diaria (avg - min). Sin avg/min → null.
  if (hr?.avg != null && hr.min != null) {
    const amplitude = hr.avg - hr.min;
    // 0–40 bpm de amplitud → 0–100. Es un proxy grueso, mejor que nada.
    return clamp(linMap(amplitude, 0, 40, 0, 100), 0, 100);
  }
  return null;
}

/** Sub-score de pasos: 0–15000 pasos → 0–100. */
function stepsComp(today: DayInput): number | null {
  const qty = today.metrics?.steps?.qty;
  if (qty == null) return null;
  return clamp(linMap(qty, 0, 15000, 0, 100), 0, 100);
}

function toState(score: number): StrainState {
  if (score >= 66) return 'high';
  if (score >= 33) return 'moderate';
  return 'low';
}

/**
 * Calcula el strain del día. `age` se usa para la FCmax estimada. Devuelve
 * `null` si no hay ningún componente con dato.
 */
export function computeStrain(today: DayInput, baselines: Baselines, age: number): StrainResult | null {
  const components: StrainComponents = {};
  const weighted: WeightedComponent[] = [];

  const energy = energyComp(today, baselines.energyMean);
  if (energy != null) {
    components.energy = round(energy, 1);
    weighted.push({ value: energy, weight: W.energy });
  }

  const cardio = cardioComp(today, age);
  if (cardio != null) {
    components.cardio = round(cardio, 1);
    weighted.push({ value: cardio, weight: W.cardio });
  }

  const steps = stepsComp(today);
  if (steps != null) {
    components.steps = round(steps, 1);
    weighted.push({ value: steps, weight: W.steps });
  }

  if (weighted.length === 0) return null;

  let totalWeight = 0;
  for (const c of weighted) totalWeight += c.weight;
  let acc = 0;
  for (const c of weighted) acc += c.value * (c.weight / totalWeight);

  const score = round(clamp(acc, 0, 100));

  return { score, state: toState(score), components };
}
