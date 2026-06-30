// Contrato de datos biométricos del backend (GET /api/metrics/latest) y tipos de
// la vista de la pestaña Hoy.
//
// MUY IMPORTANTE: la serialización del backend OMITE las claves `undefined` (un
// campo no poblado NO llega como `null`, simplemente NO está). Por eso TODO va
// como opcional y se comprueba presencia (`metrics.steps?.qty != null`).

// ---------------------------------------------------------------------------
// DTO del backend
// ---------------------------------------------------------------------------

export interface SleepMetric {
  /** Horas decimales (p. ej. 6.9 = 6h 54m). */
  total?: number;
  deep?: number;
  rem?: number;
  core?: number;
  awake?: number;
  sleepStart?: string;
  sleepEnd?: string;
  source?: string;
}

// Series horarias (intradía) que el backend SÍ envía cuando hay desglose. Como
// la serialización omite claves `undefined`, las series van como OPCIONALES: un
// día sin desglose simplemente NO trae `samples`/`hourly` (no llega vacío).

/** Muestra horaria de FC: "HH:00" + mín/avg/máx del tramo (claves opcionales). */
export interface HeartRateSample {
  /** Etiqueta de hora "HH:00". */
  t: string;
  min?: number;
  avg?: number;
  max?: number;
}

/** Tramo horario de pasos: "HH:00" + cantidad acumulada de esa hora. */
export interface StepsHour {
  /** Etiqueta de hora "HH:00". */
  t: string;
  qty: number;
}

/** Tramo horario de energía activa: "HH:00" + kcal de esa hora. */
export interface ActiveEnergyHour {
  /** Etiqueta de hora "HH:00". */
  t: string;
  kcal: number;
}

export interface HeartRateMetric {
  min?: number;
  max?: number;
  avg?: number;
  source?: string;
  /** Serie horaria de FC del día (ausente si el sync no trajo intradía). */
  samples?: HeartRateSample[];
}

export interface StepsMetric {
  qty?: number;
  source?: string;
  /** Serie horaria de pasos del día (ausente si el sync no trajo intradía). */
  hourly?: StepsHour[];
}

export interface ActiveEnergyMetric {
  kcal?: number;
  source?: string;
  /** Serie horaria de energía activa (ausente si el sync no trajo intradía). */
  hourly?: ActiveEnergyHour[];
}

export interface HrvMetric {
  /** Entrada manual futura (hoy casi siempre ausente). */
  value?: number;
  source?: string;
}

export interface Spo2Metric {
  value?: number;
  source?: string;
}

export interface WeightMetric {
  kg?: number;
  source?: string;
}

export interface DailyMetricsMetrics {
  sleep?: SleepMetric;
  heartRate?: HeartRateMetric;
  steps?: StepsMetric;
  activeEnergy?: ActiveEnergyMetric;
  hrv?: HrvMetric;
  spo2?: Spo2Metric;
  weight?: WeightMetric;
}

export interface DailyMetricsDto {
  id: string;
  userId: string;
  /** "YYYY-MM-DD". */
  date: string;
  metrics: DailyMetricsMetrics;
  readiness?: { score?: number };
  /** ISO. */
  createdAt: string;
  /** ISO. */
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Scores biométricos (espejo EXACTO de server/src/services/scores/types.ts).
// El backend los calcula al vuelo y los envía en GET /api/metrics/latest.
// El DTO está duplicado a mano (no hay paquete compartido): cualquier cambio en
// el motor debe replicarse aquí. Cada score es `null` si faltan datos clave.
// ---------------------------------------------------------------------------

export type SleepQualityState = 'excellent' | 'good' | 'fair' | 'poor';

export interface SleepQualityComponents {
  durationScore: number;
  restorativeScore: number;
  efficiencyScore: number;
  continuityScore: number;
}

export interface SleepQualityResult {
  score: number;
  state: SleepQualityState;
  components: SleepQualityComponents;
}

// NOTA: el `state` del readiness del backend usa los MISMOS literales que el
// `ReadinessState` de la vista (recovered/moderate/fatigue). Reutilizamos ese
// tipo (definido más abajo) para que ambos casen sin duplicar literales.
export type ReadinessConfidence = 'high' | 'medium' | 'low';

export interface ReadinessComponents {
  sleep?: number;
  rhr?: number;
  hrv?: number;
  load?: number;
}

export interface ReadinessResult {
  score: number;
  state: ReadinessState;
  confidence: ReadinessConfidence;
  components: ReadinessComponents;
}

export type StrainState = 'low' | 'moderate' | 'high';

export interface StrainComponents {
  energy?: number;
  cardio?: number;
  steps?: number;
}

export interface StrainResult {
  score: number;
  state: StrainState;
  components: StrainComponents;
}

export type EnergyLevelState = 'low' | 'medium' | 'high';

export interface EnergyLevelResult {
  score: number;
  state: EnergyLevelState;
}

export type StressState = 'low' | 'moderate' | 'high';

export interface StressComponents {
  autonomic?: number;
  sleepDebt?: number;
  rhrElev?: number;
}

export interface StressResult {
  score: number;
  state: StressState;
  /** Siempre 'proxy': el estrés se infiere, no se mide directamente. */
  confidence: 'proxy';
  components: StressComponents;
}

/** Conjunto de scores del día. Cada campo es `null` si faltan datos clave. */
export interface DailyScores {
  sleepQuality: SleepQualityResult | null;
  readiness: ReadinessResult | null;
  strain: StrainResult | null;
  energy: EnergyLevelResult | null;
  stress: StressResult | null;
}

/**
 * Respuesta del endpoint. `dailyMetrics: null` (con `scores: null`) = aún no hay
 * ningún dato sincronizado. Los `scores` se calculan al vuelo en el backend.
 */
export interface LatestMetricsResponse {
  dailyMetrics: DailyMetricsDto | null;
  scores: DailyScores | null;
}

// ---------------------------------------------------------------------------
// Vista de la card de métrica (lo que consume MetricWidget)
// ---------------------------------------------------------------------------

/** Identificador de métrica → mapea a su token de color `--m-*`. */
export type MetricKey =
  | 'sleep'
  | 'rhr'
  | 'steps'
  | 'energy'
  | 'energyLevel'
  | 'strain'
  | 'hrv'
  | 'spo2'
  | 'weight'
  | 'stress';

/** Dirección del delta de una métrica (señal semántica). */
export type DeltaDirection = 'up' | 'down' | 'flat';

/** Delta opcional de una métrica (solo si hay histórico). */
export interface MetricDelta {
  direction: DeltaDirection;
  label: string;
}

// Tipo discriminado de la card: cada estado pinta un contenido distinto pero
// conserva el chrome y el tamaño del widget (DESIGN.md §11b).

interface MetricCardBase {
  key: MetricKey;
  /** Label corto en mayúsculas técnicas. */
  label: string;
}

/** Card con dato real presente. */
export interface MetricCardData extends MetricCardBase {
  state: 'data';
  /** Valor ya formateado como cadena (la mono lo alinea con tabular-nums). */
  value: string;
  /** Unidad pequeña pegada al número; vacío si el valor ya la incluye. */
  unit?: string;
  /** Texto bajo el valor (meta, mín de hoy…). */
  caption: string;
  /** Relleno del anillo 0–100 (preprocesado en JS, nunca por la IA). */
  ringPct: number;
  /** Delta opcional: solo si hay histórico (en esta tarea, ninguna lo tiene). */
  delta?: MetricDelta;
  /**
   * Si la card tiene vista de detalle intradía (DESIGN.md §12) → navega a
   * `/metrica/:key`. Las cards de scores derivados sin desglose (nivel de
   * energía, esfuerzo) van a `false`: son dato pero NO navegan.
   */
  navigable?: boolean;
}

/** Métrica real pero ausente en el DTO de hoy. */
export interface MetricCardEmpty extends MetricCardBase {
  state: 'empty';
  /** Caption breve tipo "sin dato". */
  caption: string;
}

/** Feature/métrica aún no implementada (entrada manual o cálculo pendiente). */
export interface MetricCardSoon extends MetricCardBase {
  state: 'soon';
  /** Motivo breve de por qué aún no está (p. ej. "Requiere HRV"). Opcional. */
  reason?: string;
}

export type MetricCard = MetricCardData | MetricCardEmpty | MetricCardSoon;

// ---------------------------------------------------------------------------
// Tipos de los widgets aún no cableados a datos reales (Readiness · Coach ·
// Tendencia). En esta iteración SIEMPRE van en modo "próximamente", pero el
// contrato de datos se conserva para cuando el backend los provea.
// ---------------------------------------------------------------------------

/** Estado de Readiness coloreado con señales semánticas. */
export type ReadinessState = 'recovered' | 'moderate' | 'fatigue';

// NOTA para la subtarea de UI: hay SOLAPE entre `ReadinessData` (modelo de vista,
// con `sub: string`) y `ReadinessResult` (score real del backend, con `confidence`
// y `components`). Comparten `state` (mismos literales). Al cablear el widget de
// Readiness habrá que decidir si se mapea `ReadinessResult` -> `ReadinessData` o si
// el widget consume directamente el resultado del motor. No se borra ninguno aquí.
export interface ReadinessData {
  /** Score 0–100 (HRV + sueño + RHR). */
  score: number;
  state: ReadinessState;
  /** Subtítulo bajo el estado (contexto breve). */
  sub: string;
}

export interface CoachData {
  /** Título del plan del día. */
  title: string;
  /** Cuerpo del plan; los tramos en `**...**` se resaltan en --text. */
  body: string;
  /** Chips de datos (mono): cada uno un label técnico + valor. */
  chips: { label: string; value: string }[];
}

/** Punto de la tendencia (coordenadas del viewBox 0..600 / 0..110). */
export interface TrendPoint {
  x: number;
  y: number;
}

export interface TrendData {
  label: string;
  delta: MetricDelta;
  points: TrendPoint[];
}
