// Mapeo puro DTO + scores → cards de la pestaña Hoy.
//
// Transforma el DailyMetricsDto del backend (datos crudos) y los DailyScores
// (scores derivados, calculados al vuelo en el backend) en las cards que pinta
// la rejilla principal. Todo el preprocesado (medias, formato, ringPct) ocurre
// aquí en JS, nunca en la IA (CLAUDE.md §4).
//
// Dos familias de card (DESIGN.md §14):
// - Scores interpretados: Sueño (calidad 0–100%), Nivel de energía, Esfuerzo.
//   Se pintan con su --m-* propio; el ESTADO va en el caption (texto, no color)
//   porque son neutros (mucho esfuerzo no es "malo"). Sin desglose intradía
//   → NO navegan.
// - Crudos: FC reposo, Pasos, Energía activa (kcal). Conservan su comportamiento
//   previo (anillo --m-*, navegan a su desglose intradía).
//
// NOTA: las metas y los ringPct de las CRUDAS son PROVISIONALES (heurísticas
// hasta que el perfil del usuario defina objetivos reales). En esta tarea
// NINGUNA card tiene día previo, así que NINGUNA lleva delta (DESIGN.md §11b:
// sin histórico → sin ↑/↓).

import { clampPct, formatHours, formatInteger } from './format';
import type {
  DailyMetricsDto,
  DailyScores,
  EnergyLevelState,
  MetricCard,
  SleepQualityState,
  StrainState,
} from './types';

// Metas provisionales (futuro: salen del objetivo/rol del usuario).
const STEPS_GOAL = 10_000; // meta de pasos
const ENERGY_GOAL_KCAL = 500; // meta de energía activa en kcal
// FC reposo: heurística de relleno entre 80 bpm (vacío) y 40 bpm (lleno).
const RHR_RING_MAX_BPM = 80;
const RHR_RING_MIN_BPM = 40;

// --- Mapas estado → label español (DESIGN.md §14) ---------------------------

const SLEEP_QUALITY_LABEL: Record<SleepQualityState, string> = {
  excellent: 'Excelente',
  good: 'Bueno',
  fair: 'Regular',
  poor: 'Malo',
};

const ENERGY_LEVEL_LABEL: Record<EnergyLevelState, string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
};

const STRAIN_LABEL: Record<StrainState, string> = {
  low: 'Bajo',
  moderate: 'Moderado',
  high: 'Alto',
};

/**
 * Construye las cards de la rejilla principal a partir del DTO crudo y de los
 * scores derivados, en orden de bento (DESIGN.md §14):
 *   Sueño · Nivel de energía · Esfuerzo (interpretados) →
 *   FC reposo · Pasos · Energía activa (crudos) → Estrés (próximamente).
 *
 * Una métrica real ausente va en estado "empty"; un score derivado ausente
 * simplemente NO se añade (no se inventa una card vacía para algo que aún no
 * se puede calcular).
 */
export function buildMetricCards(
  dto: DailyMetricsDto | null,
  scores: DailyScores | null,
): MetricCard[] {
  const m = dto?.metrics;
  const cards: MetricCard[] = [];

  // --- Scores interpretados -------------------------------------------------

  // Sueño (--m-sleep, navegable): el anillo representa la CALIDAD (0–100%); las
  // horas pasan a sub-dato del caption. Sin calidad → cae a horas crudas (o
  // "sin dato" si tampoco hay total).
  const sleepQuality = scores?.sleepQuality;
  const sleepTotal = m?.sleep?.total;
  if (sleepQuality) {
    const horas = sleepTotal != null ? formatHours(sleepTotal) : '—';
    cards.push({
      key: 'sleep',
      state: 'data',
      label: 'Sueño',
      value: String(sleepQuality.score),
      unit: '%',
      caption: `${SLEEP_QUALITY_LABEL[sleepQuality.state]} · ${horas}`,
      ringPct: clampPct(sleepQuality.score),
      navigable: true,
    });
  } else if (sleepTotal != null) {
    cards.push({
      key: 'sleep',
      state: 'data',
      label: 'Sueño',
      value: formatHours(sleepTotal),
      caption: 'meta · 8 h',
      ringPct: clampPct((sleepTotal / 8) * 100),
      navigable: true,
    });
  } else {
    cards.push({ key: 'sleep', state: 'empty', label: 'Sueño', caption: 'sin dato' });
  }

  // Nivel de energía (--m-energylvl, NO navegable): score derivado; el estado va
  // en el caption (texto, no color). Ausente → no se muestra (no se inventa).
  const energyLevel = scores?.energy;
  if (energyLevel) {
    cards.push({
      key: 'energyLevel',
      state: 'data',
      label: 'Nivel de energía',
      value: String(energyLevel.score),
      caption: ENERGY_LEVEL_LABEL[energyLevel.state],
      ringPct: clampPct(energyLevel.score),
      navigable: false,
    });
  }

  // Esfuerzo (--m-strain, NO navegable): score derivado neutro; estado en el
  // caption. Ausente → no se muestra.
  const strain = scores?.strain;
  if (strain) {
    cards.push({
      key: 'strain',
      state: 'data',
      label: 'Esfuerzo',
      value: String(strain.score),
      caption: STRAIN_LABEL[strain.state],
      ringPct: clampPct(strain.score),
      navigable: false,
    });
  }

  // --- Crudos (sin cambios de comportamiento: navegan a su desglose) --------

  // FC reposo (--m-rhr): proxy = mínimo de FC del día. Menos pulsaciones →
  // anillo más lleno (heurística provisional).
  const rhrMin = m?.heartRate?.min;
  cards.push(
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
          navigable: true,
        }
      : { key: 'rhr', state: 'empty', label: 'FC reposo', caption: 'sin dato' },
  );

  // Pasos (--m-steps): de metrics.steps.qty.
  const stepsQty = m?.steps?.qty;
  cards.push(
    stepsQty != null
      ? {
          key: 'steps',
          state: 'data',
          label: 'Pasos',
          value: formatInteger(stepsQty),
          caption: 'meta · 10 k',
          ringPct: clampPct((stepsQty / STEPS_GOAL) * 100),
          navigable: true,
        }
      : { key: 'steps', state: 'empty', label: 'Pasos', caption: 'sin dato' },
  );

  // Energía activa (--m-energy): de metrics.activeEnergy.kcal.
  const energyKcal = m?.activeEnergy?.kcal;
  cards.push(
    energyKcal != null
      ? {
          key: 'energy',
          state: 'data',
          label: 'Energía activa',
          value: formatInteger(energyKcal),
          unit: 'kcal',
          caption: 'activa · hoy',
          ringPct: clampPct((energyKcal / ENERGY_GOAL_KCAL) * 100),
          navigable: true,
        }
      : {
          key: 'energy',
          state: 'empty',
          label: 'Energía activa',
          caption: 'sin dato',
        },
  );

  // --- Próximamente ---------------------------------------------------------

  // Estrés: requiere HRV (entrada manual aún no implementada). Va en "soon" con
  // el motivo concreto (DESIGN.md §14).
  cards.push({
    key: 'stress',
    state: 'soon',
    label: 'Estrés',
    reason: 'Requiere HRV',
  });

  return cards;
}

/** Cards manuales aún no implementadas (fila secundaria): HRV · SpO2 · Peso. */
export function buildManualCards(): MetricCard[] {
  return [
    { key: 'hrv', state: 'soon', label: 'HRV' },
    { key: 'spo2', state: 'soon', label: 'SpO₂' },
    { key: 'weight', state: 'soon', label: 'Peso' },
  ];
}
