// Metadata de navegación compartida por la regleta (desktop) y la tab bar
// (móvil). Una sola fuente de verdad para las 4 pestañas (DESIGN.md §6).

export interface NavTab {
  /** Numeral mono mostrado en la regleta (01..04). */
  num: string;
  /** Label corto de la regleta y tab bar (Hoy / Tnd / Ent / Prf). */
  short: string;
  /** Título largo (header de pestaña, aria-label). */
  long: string;
  /** Ruta de react-router. */
  to: string;
}

export const NAV_TABS: NavTab[] = [
  { num: '01', short: 'Hoy', long: 'Hoy', to: '/' },
  { num: '02', short: 'Tnd', long: 'Tendencias', to: '/tendencias' },
  { num: '03', short: 'Ent', long: 'Entreno', to: '/entreno' },
  { num: '04', short: 'Prf', long: 'Perfil', to: '/perfil' },
];
