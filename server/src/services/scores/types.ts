// Tipos del motor de scores biométricos. Son funciones PURAS: no tocan la BD ni
// dependen de Mongoose ni del client. Por eso replicamos aquí el shape mínimo de
// las métricas que leemos (subconjunto del modelo DailyMetrics), en vez de
// importar el documento hidratado. Recuerda: las claves `undefined` NO llegan
// (un campo no poblado simplemente NO está), así que TODO es opcional.

// ---------------------------------------------------------------------------
// Entrada: métricas crudas de un día (subconjunto de DailyMetrics.metrics)
// ---------------------------------------------------------------------------

export interface SleepInput {
  /** Horas decimales (p. ej. 6.9 = 6h 54m). */
  total?: number;
  deep?: number;
  rem?: number;
  core?: number;
  /** Horas decimales despierto durante el periodo de sueño. */
  awake?: number;
  sleepStart?: string;
  sleepEnd?: string;
  source?: string;
}

/** Muestra horaria de FC: "HH:00" + mín/avg/máx del tramo. */
export interface HeartRateSampleInput {
  t: string;
  min?: number;
  avg?: number;
  max?: number;
}

export interface HeartRateInput {
  /** FC reposo = proxy de `min`. */
  min?: number;
  max?: number;
  avg?: number;
  source?: string;
  samples?: HeartRateSampleInput[];
}

export interface StepsInput {
  qty?: number;
  source?: string;
}

export interface ActiveEnergyInput {
  kcal?: number;
  source?: string;
}

export interface HrvInput {
  value?: number;
  source?: string;
}

export interface MetricsInput {
  sleep?: SleepInput;
  heartRate?: HeartRateInput;
  steps?: StepsInput;
  activeEnergy?: ActiveEnergyInput;
  hrv?: HrvInput;
}

/** Documento diario mínimo que consume el motor (hoy o histórico). */
export interface DayInput {
  /** "YYYY-MM-DD". */
  date: string;
  metrics?: MetricsInput;
}

/** Datos del usuario que necesita el motor (solo para derivar la edad). */
export interface UserInput {
  /** Fecha de nacimiento (campo real del modelo User). */
  birthDate?: Date | string;
  /** Edad ya calculada (override opcional; si no, se deriva de birthDate). */
  age?: number;
}

// ---------------------------------------------------------------------------
// Baselines (medias/desviaciones del histórico, preprocesadas en JS)
// ---------------------------------------------------------------------------

/** Resultado de una baseline: media, desviación y nº de observaciones válidas. */
export interface Baseline {
  mean: number;
  /** Desviación típica (muestral, n-1). 0 cuando n < 2. */
  sd: number;
  n: number;
}

/** Conjunto de baselines que consume readiness/strain/stress. */
export interface Baselines {
  /** FC reposo (proxy `heartRate.min`). */
  rhr: Baseline;
  /** Variabilidad de FC (manual, casi siempre n = 0). */
  hrv: Baseline;
  /** Media de kcal activas del histórico completo (referencia de strain). */
  energyMean: number | undefined;
  /** Carga aguda: media de kcal de los últimos ~3 días. */
  energyAcute: number | undefined;
  /** Carga crónica: media de kcal de los días [4..28] hacia atrás. */
  energyChronic: number | undefined;
}

// ---------------------------------------------------------------------------
// Salidas: cada score con su estado y sus sub-componentes (para depurar/UI)
// ---------------------------------------------------------------------------

export type SleepState = 'excellent' | 'good' | 'fair' | 'poor';

export interface SleepQualityComponents {
  durationScore: number;
  restorativeScore: number;
  efficiencyScore: number;
  continuityScore: number;
}

export interface SleepQualityResult {
  score: number;
  state: SleepState;
  components: SleepQualityComponents;
}

export type ReadinessState = 'recovered' | 'moderate' | 'fatigue';
export type Confidence = 'high' | 'medium' | 'low';

export interface ReadinessComponents {
  sleep?: number;
  rhr?: number;
  hrv?: number;
  load?: number;
}

export interface ReadinessResult {
  score: number;
  state: ReadinessState;
  confidence: Confidence;
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

export type EnergyState = 'low' | 'medium' | 'high';

export interface EnergyLevelResult {
  score: number;
  state: EnergyState;
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
  /** Siempre 'proxy': no medimos estrés directamente, lo inferimos. */
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
