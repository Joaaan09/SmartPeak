// Mapeo puro DTO → cards de la pestaña Hoy.
//
// Transforma el DailyMetricsDto del backend en las 4 cards REALES que pinta la
// rejilla principal. Todo el preprocesado (medias, formato, ringPct) ocurre aquí
// en JS, nunca en la IA (CLAUDE.md §4).
//
// NOTA: las metas y los ringPct son PROVISIONALES (heurísticas sensatas hasta
// que el perfil del usuario defina objetivos reales). En esta tarea NINGUNA card
// tiene día previo, así que NINGUNA lleva delta (DESIGN.md §11b: sin histórico →
// sin ↑/↓).

import { clampPct, formatHours, formatInteger } from './format';
import type { DailyMetricsDto, MetricCard } from './types';

// Metas provisionales (futuro: salen del objetivo/rol del usuario).
const SLEEP_GOAL_H = 8; // meta de sueño en horas
const STEPS_GOAL = 10_000; // meta de pasos
const ENERGY_GOAL_KCAL = 500; // meta de energía activa en kcal
// FC reposo: heurística de relleno entre 80 bpm (vacío) y 40 bpm (lleno).
const RHR_RING_MAX_BPM = 80;
const RHR_RING_MIN_BPM = 40;

/**
 * Construye las 4 cards reales (Sueño · FC reposo · Pasos · Energía activa) a
 * partir del DTO. Si una métrica falta, esa card va en estado "empty" (sin dato),
 * NO en "soon" (próximamente).
 */
export function buildMetricCards(dto: DailyMetricsDto | null): MetricCard[] {
  const m = dto?.metrics;

  // Sueño (--m-sleep): de metrics.sleep.total (horas decimales).
  const sleepTotal = m?.sleep?.total;
  const sleep: MetricCard =
    sleepTotal != null
      ? {
          key: 'sleep',
          state: 'data',
          label: 'Sueño',
          value: formatHours(sleepTotal),
          caption: 'meta · 8 h',
          ringPct: clampPct((sleepTotal / SLEEP_GOAL_H) * 100),
        }
      : { key: 'sleep', state: 'empty', label: 'Sueño', caption: 'sin dato' };

  // FC reposo (--m-rhr): proxy = mínimo de FC del día. Menos pulsaciones → anillo
  // más lleno (heurística provisional).
  const rhrMin = m?.heartRate?.min;
  const rhr: MetricCard =
    rhrMin != null
      ? {
          key: 'rhr',
          state: 'data',
          label: 'FC reposo',
          value: formatInteger(rhrMin),
          unit: 'bpm',
          caption: 'mín · hoy',
          ringPct: clampPct(
            ((RHR_RING_MAX_BPM - rhrMin) /
              (RHR_RING_MAX_BPM - RHR_RING_MIN_BPM)) *
              100,
          ),
        }
      : { key: 'rhr', state: 'empty', label: 'FC reposo', caption: 'sin dato' };

  // Pasos (--m-steps): de metrics.steps.qty.
  const stepsQty = m?.steps?.qty;
  const steps: MetricCard =
    stepsQty != null
      ? {
          key: 'steps',
          state: 'data',
          label: 'Pasos',
          value: formatInteger(stepsQty),
          caption: 'meta · 10 k',
          ringPct: clampPct((stepsQty / STEPS_GOAL) * 100),
        }
      : { key: 'steps', state: 'empty', label: 'Pasos', caption: 'sin dato' };

  // Energía activa (--m-energy): de metrics.activeEnergy.kcal.
  const energyKcal = m?.activeEnergy?.kcal;
  const energy: MetricCard =
    energyKcal != null
      ? {
          key: 'energy',
          state: 'data',
          label: 'Energía activa',
          value: formatInteger(energyKcal),
          unit: 'kcal',
          caption: 'activa · hoy',
          ringPct: clampPct((energyKcal / ENERGY_GOAL_KCAL) * 100),
        }
      : {
          key: 'energy',
          state: 'empty',
          label: 'Energía activa',
          caption: 'sin dato',
        };

  return [sleep, rhr, steps, energy];
}

/** Cards manuales aún no implementadas (fila secundaria): HRV · SpO2 · Peso. */
export function buildManualCards(): MetricCard[] {
  return [
    { key: 'hrv', state: 'soon', label: 'HRV' },
    { key: 'spo2', state: 'soon', label: 'SpO₂' },
    { key: 'weight', state: 'soon', label: 'Peso' },
  ];
}
