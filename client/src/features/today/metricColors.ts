// Mapa único métrica → su token de color (--m-*). Cada color vive SOLO en su
// métrica (DESIGN.md §3). Se extrae aquí para compartirlo entre la card (Hoy) y
// la vista de detalle (desglose intradía), sin duplicar el objeto ni hardcodear
// colores (cero literales: solo var(--m-*)).
//
// (energy/spo2 no tienen clase Tailwind propia; quien lo necesite lee la var CSS
// por estilo inline, igual que el anillo de MetricWidget.)

import type { MetricKey } from './types';

export const metricColorVar: Record<MetricKey, string> = {
  sleep: 'var(--m-sleep)',
  rhr: 'var(--m-rhr)',
  steps: 'var(--m-steps)',
  energy: 'var(--m-energy)',
  energyLevel: 'var(--m-energylvl)', // nivel de energía (score derivado) — cian/turquesa
  strain: 'var(--m-strain)', // esfuerzo (score derivado) — violeta/magenta
  hrv: 'var(--m-hrv)',
  spo2: 'var(--text-faint)', // sin token propio; en próximamente no se usa color
  weight: 'var(--m-weight)',
  stress: 'var(--text-faint)', // mientras es "soon" no usa color de métrica
};
