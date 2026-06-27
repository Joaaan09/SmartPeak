import { useEffect, useState } from 'react';

// Hook reactivo para `prefers-reduced-motion` (DESIGN.md §8: reducir, no eliminar).
// Devuelve `true` si el usuario pide menos movimiento; los componentes lo usan
// para saltar count-ups y llenados de anillo, mostrando el valor final directo.
export function usePrefersReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
