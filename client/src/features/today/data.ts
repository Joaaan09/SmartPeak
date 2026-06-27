// Datos de ejemplo TIPADOS de la pestaña Hoy.
//
// PLACEHOLDER: estos valores replican el mockup canónico (mockup-mono.html) y
// existen solo para construir la UI en modo vista. Cuando exista la
// sincronización biométrica real (estrategia "Pull" del CLAUDE.md §2), el
// backend recalculará Readiness/métricas y estos datos saldrán de la API.
//
// El ROL del coach y de la píldora NO sale de aquí: se lee del `user.role` real
// (auth). Estos mocks no llevan rol a propósito.

/** Estado de Readiness coloreado con señales semánticas. */
export type ReadinessState = 'recovered' | 'moderate' | 'fatigue';

export interface ReadinessData {
  /** Score 0–100 (HRV + sueño + RHR). */
  score: number;
  state: ReadinessState;
  /** Subtítulo bajo el estado (contexto breve). */
  sub: string;
}

/** Dirección del delta de una métrica (señal semántica). */
export type DeltaDirection = 'up' | 'down' | 'flat';

/** Identificador de métrica → mapea a su token de color `--m-*`. */
export type MetricKey = 'hrv' | 'rhr' | 'sleep' | 'steps' | 'weight';

export interface MetricData {
  key: MetricKey;
  /** Label corto en mayúsculas técnicas (tira meta / labels). */
  label: string;
  /** Valor ya formateado como cadena (la mono lo alinea con tabular-nums). */
  value: string;
  /** Unidad pequeña pegada al número; vacío si el valor ya la incluye (p. ej. "7:48"). */
  unit?: string;
  /** Texto bajo el valor (meta, media de 7 días…). */
  caption: string;
  /** Relleno del anillo 0–100 (preprocesado en JS, nunca por la IA). */
  ringPct: number;
  delta: { direction: DeltaDirection; label: string };
}

export interface CoachData {
  /** Título del plan del día. */
  title: string;
  /** Cuerpo del plan; los tramos en `strong` se resaltan en --text. */
  body: string;
  /** Chips de datos (mono): cada uno un label técnico + valor. */
  chips: { label: string; value: string }[];
}

/** Punto de la tendencia HRV de 7 días (coordenadas del viewBox 0..600 / 0..110). */
export interface TrendPoint {
  x: number;
  y: number;
}

export interface TrendData {
  label: string;
  delta: { direction: DeltaDirection; label: string };
  points: TrendPoint[];
}

export interface SyncData {
  /** Fuente de los datos (Apple Health vía Atajo de iOS). */
  source: string;
  /** Marca de la última sincronización (ISO). */
  lastSyncedAt: string;
}

export interface TodayData {
  readiness: ReadinessData;
  metrics: MetricData[];
  coach: CoachData;
  trend: TrendData;
  sync: SyncData;
}

// ----------------------------------------------------------------------------
// Datos de ejemplo (placeholder, valores del mockup canónico).
// ----------------------------------------------------------------------------

export const todayData: TodayData = {
  readiness: {
    score: 78,
    state: 'recovered',
    sub: 'Listo para sesión pesada · HRV +14%',
  },
  metrics: [
    {
      key: 'hrv',
      label: 'HRV',
      value: '112',
      unit: 'ms',
      caption: '7 días · 61 ms',
      ringPct: 74,
      delta: { direction: 'up', label: '14%' },
    },
    {
      key: 'rhr',
      label: 'FC reposo',
      value: '48',
      unit: 'bpm',
      caption: 'media · 47',
      ringPct: 42,
      delta: { direction: 'flat', label: '0%' },
    },
    {
      key: 'sleep',
      label: 'Sueño',
      value: '7:48',
      caption: 'meta · 8 h',
      ringPct: 82,
      delta: { direction: 'up', label: '6%' },
    },
    {
      key: 'steps',
      label: 'Pasos',
      value: '8 214',
      caption: 'meta · 10 k',
      ringPct: 55,
      delta: { direction: 'down', label: '12%' },
    },
  ],
  coach: {
    title: 'Plan de hoy',
    body:
      'Cuerpo **recuperado**. Intensidad en básicos: sentadilla y press **85–90%**. ' +
      'Accesorios sin llegar al fallo. Descanso 3–4 min.',
    chips: [
      { label: 'CARGA', value: '14 200 kg' },
      { label: 'HRV 7D', value: '61 ms' },
      { label: 'RACHA', value: '12 d' },
    ],
  },
  trend: {
    label: 'Tendencia HRV · 7 días',
    delta: { direction: 'up', label: '9% media' },
    // Coordenadas del viewBox del mockup (0..600 en X, 0..110 en Y; Y invertida).
    points: [
      { x: 0, y: 78 },
      { x: 100, y: 70 },
      { x: 200, y: 82 },
      { x: 300, y: 58 },
      { x: 400, y: 62 },
      { x: 500, y: 40 },
      { x: 600, y: 30 },
    ],
  },
  sync: {
    source: 'Apple Health',
    lastSyncedAt: '2026-06-27T06:42:00',
  },
};
