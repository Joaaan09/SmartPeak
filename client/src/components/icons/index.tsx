import type { SVGProps } from 'react';

// Catálogo mínimo de iconos SVG inline (DESIGN.md §0/§6: nada de librerías tipo
// Lucide en el chrome). currentColor para heredar el monocromo; aria-hidden por
// defecto porque siempre acompañan a un texto/label accesible.

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  'aria-hidden': true,
} as const;

/** Luna (toggle de tema). */
export function MoonIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8z" />
    </svg>
  );
}

/** Flechas circulares de sincronización. */
export function SyncIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.7-3" />
      <path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.7 3" />
      <path d="M21 3v5h-5" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

// --- Iconos de navegación (regleta + tab bar, DESIGN.md §6) ---

/** Hoy → dot relleno (●, "ahora / en directo"). Es su icono, no el marcador de activo. */
export function HoyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Tendencias → mini bar-chart (3 barras de alturas distintas). */
export function TrendsIcon(props: IconProps) {
  return (
    <svg {...base} {...props} strokeLinecap="round">
      <path d="M6 19v-7" />
      <path d="M12 19V5" />
      <path d="M18 19v-4" />
    </svg>
  );
}

/** Entreno → chevron/caret hacia arriba (∧, progresión / levantar). */
export function TrainIcon(props: IconProps) {
  return (
    <svg {...base} {...props} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 14l7-7 7 7" />
    </svg>
  );
}

/** Perfil → persona (cabeza redonda + hombros, contorno). */
export function ProfileIcon(props: IconProps) {
  return (
    <svg {...base} {...props} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}
