// Metadata de navegación compartida por la regleta (desktop) y la tab bar
// (móvil). Una sola fuente de verdad para las 4 pestañas (DESIGN.md §6).

import type { JSX, SVGProps } from 'react';
import { HoyIcon, TrendsIcon, TrainIcon, ProfileIcon } from '../components/icons';

export interface NavTab {
  /** Numeral mono (legacy; el rail ya no lo muestra, se conserva por compat). */
  num: string;
  /** Label corto (legacy; el rail ya no lo muestra). */
  short: string;
  /** Título largo (label visible en rail/tab bar, header de pestaña, aria-label). */
  long: string;
  /** Ruta de react-router. */
  to: string;
  /** Icono custom de la pestaña (rail + tab bar), monocromo `currentColor`. */
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
}

export const NAV_TABS: NavTab[] = [
  { num: '01', short: 'Hoy', long: 'Hoy', to: '/', Icon: HoyIcon },
  { num: '02', short: 'Tnd', long: 'Tendencias', to: '/tendencias', Icon: TrendsIcon },
  { num: '03', short: 'Ent', long: 'Entreno', to: '/entreno', Icon: TrainIcon },
  { num: '04', short: 'Prf', long: 'Perfil', to: '/perfil', Icon: ProfileIcon },
];
