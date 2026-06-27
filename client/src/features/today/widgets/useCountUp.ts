import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../../lib/usePrefersReducedMotion';

// Count-up de llegada de dato (DESIGN.md §8): 0 → target en `duration` ms con
// ease-out fuerte (expo-ish, igual que el mockup canónico). Devuelve el valor
// actual (0..1) de progreso y el número redondeado; con prefers-reduced-motion
// salta directo al valor final (sin conteo).
//
// El progreso `t` (0..1) sirve además para llenar el anillo SVG en sincronía.

// ease-out fuerte: 1 - (1 - t)^5 (mismo del mockup).
const easeOutExpo = (t: number) => 1 - Math.pow(1 - t, 5);

export function useCountUp(target: number, duration = 800) {
  const reduced = usePrefersReducedMotion();
  const [progress, setProgress] = useState(reduced ? 1 : 0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Reduced-motion: valor final directo, sin animación.
    if (reduced) {
      setProgress(1);
      return;
    }

    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      setProgress(easeOutExpo(t));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setProgress(1); // asegura el valor exacto final
      }
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, reduced]);

  return { progress, value: Math.round(target * progress) };
}
