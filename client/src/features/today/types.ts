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

export interface HeartRateMetric {
  min?: number;
  max?: number;
  avg?: number;
  source?: string;
}

export interface StepsMetric {
  qty?: number;
  source?: string;
}

export interface ActiveEnergyMetric {
  kcal?: number;
  source?: string;
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

/** Respuesta del endpoint. `dailyMetrics: null` = aún no hay ningún dato sincronizado. */
export interface LatestMetricsResponse {
  dailyMetrics: DailyMetricsDto | null;
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
  | 'hrv'
  | 'spo2'
  | 'weight';

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
}

export type MetricCard = MetricCardData | MetricCardEmpty | MetricCardSoon;

// ---------------------------------------------------------------------------
// Tipos de los widgets aún no cableados a datos reales (Readiness · Coach ·
// Tendencia). En esta iteración SIEMPRE van en modo "próximamente", pero el
// contrato de datos se conserva para cuando el backend los provea.
// ---------------------------------------------------------------------------

/** Estado de Readiness coloreado con señales semánticas. */
export type ReadinessState = 'recovered' | 'moderate' | 'fatigue';

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
