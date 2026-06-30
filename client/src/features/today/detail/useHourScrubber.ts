import { useCallback } from 'react';
import { usePointerScrub, type PointerScrub } from './usePointerScrub';

// Scrubber por horas compartido por las gráficas con eje 0–23 (pasos · energía ·
// FC). Es un wrapper fino sobre `usePointerScrub`: solo aporta el mapeo de
// clientX → hora 0–23 (24 posiciones). Toda la mecánica de hover/tap/arrastre/
// teclado/tap-fuera vive en el hook genérico. DESIGN.md §12b.
//
// El scrub NO captura el puntero: `touch-action: pan-y` arbitra el gesto
// (vertical = scroll de página, horizontal = scrub). Ver `usePointerScrub`.

const HOURS = 24;

/** Acota una hora al rango válido del eje (0–23). */
function clampHour(hour: number): number {
  return Math.max(0, Math.min(HOURS - 1, hour));
}

// Forma pública que ya consumen HourlyBarChart/HeartRateChart. Coincide con
// `PointerScrub` (que añade `setActive`, ignorable por los consumidores).
export type HourScrubber = PointerScrub;

export function useHourScrubber(): HourScrubber {
  // Mapeo de coordenada de pantalla → hora 0–23 según el ancho real del
  // contenedor (rect.width, no el viewBox del SVG).
  const pickHour = useCallback(
    (clientX: number, rect: DOMRect) =>
      clampHour(Math.floor(((clientX - rect.left) / rect.width) * HOURS)),
    [],
  );

  return usePointerScrub(pickHour, HOURS);
}
