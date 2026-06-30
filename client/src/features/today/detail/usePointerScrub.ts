import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

// Hook GENÉRICO de scrub horizontal sobre `count` posiciones discretas. Unifica
// hover (desktop) y tap/arrastre (móvil) sobre el MISMO índice activo, más
// teclado como mejora barata. DESIGN.md §12b.
//
// CLAVE (regresión táctil): el scrub NO captura el puntero (sin
// setPointerCapture). Así `touch-action: pan-y` puede arbitrar el gesto: un
// arrastre HORIZONTAL recorre la gráfica (scrub) y un arrastre VERTICAL (aunque
// empiece sobre la gráfica) hace SCROLL de la página. Cuando el navegador decide
// quedarse el gesto para hacer scroll, dispara `pointercancel`: ahí ocultamos el
// tooltip que pudo parpadear.
//
// - hover (puntero fino): onPointerMove con pointerType==='mouse' fija el índice;
//   onPointerLeave lo limpia.
// - táctil/pen (SCRUB sin captura): onPointerDown fija el índice (feedback de tap
//   inmediato) y marca isDownRef; onPointerMove con el dedo abajo hace que el
//   índice SIGA al dedo (mientras el dedo siga sobre el elemento de ancho
//   completo, los moves llegan sin captura); onPointerUp suelta y DEJA el índice
//   visible (para leer el valor); onPointerCancel suelta y limpia.
// - tap-fuera (táctil): con `active != null`, un listener global de `pointerdown`
//   limpia si el target queda fuera del contenedor.
// - teclado: el contenedor es `tabIndex=0`; ←/→ mueven el índice (clamp
//   0..count-1), Escape lo limpia (también al perder el foco, vía onBlur).

export interface PointerScrub {
  /** Índice activo (0..count-1) o `null` si no hay ninguno seleccionado. */
  active: number | null;
  /** Setter del índice activo (expuesto para casos puntuales del consumidor). */
  setActive: Dispatch<SetStateAction<number | null>>;
  /** Ref que DEBE colgar del contenedor `relative` de la gráfica. */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Handlers a esparcir sobre el contenedor de la gráfica. */
  handlers: {
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerLeave: () => void;
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onBlur: () => void;
  };
}

/**
 * Scrub genérico sobre `count` posiciones discretas.
 *
 * @param pickIndex Traduce una coordenada de pantalla (clientX) y el rect real
 *   del contenedor a un índice 0..count-1. El consumidor decide el mapeo (lineal
 *   por horas, por anchos acumulados, etc.).
 * @param count Número de posiciones discretas (clamp del teclado y de los moves).
 */
export function usePointerScrub(
  pickIndex: (clientX: number, rect: DOMRect) => number,
  count: number,
): PointerScrub {
  const [active, setActive] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ¿Hay un dedo/pen abajo? Evita que un pen en hover (sin tocar) dispare scrub
  // desde onPointerMove. No necesitamos pointerId porque no capturamos.
  const isDownRef = useRef(false);

  // Capacidad de hover real del dispositivo (DESIGN.md §11/§12b: el hover-follow
  // solo en puntero fino con hover). Se calcula una vez; en táctil puro es false
  // y, junto al filtro por pointerType, evita el "hover fantasma" tras un tap.
  // Robusto a SSR / `window` indefinido.
  const [hoverCapable] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(hover: hover) and (pointer: fine)').matches === true,
  );

  // Traduce un clientX al índice usando el ancho real del contenedor
  // (getBoundingClientRect, no el viewBox del SVG).
  const indexAt = useCallback(
    (clientX: number): number | null => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return null;
      return pickIndex(clientX, rect);
    },
    [pickIndex],
  );

  // Hover (solo ratón en dispositivo con hover real): seguir el cursor. En
  // táctil/pen el seguimiento se gestiona desde el arrastre (más abajo), no aquí.
  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') {
        if (!hoverCapable) return;
        const i = indexAt(e.clientX);
        if (i != null) setActive(i);
        return;
      }
      // Táctil/pen: solo seguimos al dedo si hay un dedo abajo (tras un down).
      if (isDownRef.current) {
        const i = indexAt(e.clientX);
        if (i != null) setActive(i);
      }
    },
    [indexAt, hoverCapable],
  );

  const onPointerLeave = useCallback(() => {
    // Solo el ratón cierra al salir; en táctil el cierre es por tap-fuera (el
    // punto debe quedarse visible tras levantar el dedo para leer el valor).
    if (!isDownRef.current) setActive(null);
  }, []);

  // Táctil/pen: el down fija el índice (feedback de tap inmediato) y marca que
  // hay un dedo abajo. NO captura el puntero: dejamos que touch-action: pan-y
  // arbitre scroll vertical vs. scrub horizontal. El ratón se ignora aquí (ya lo
  // cubre el move/hover). No hay toggle-off (chocaría con el arrastre): el
  // descarte es por tap-fuera o moviéndose a otro índice.
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      isDownRef.current = true;
      const i = indexAt(e.clientX);
      if (i != null) setActive(i);
    },
    [indexAt],
  );

  // Fin del gesto táctil al levantar: marca que no hay dedo abajo pero DEJA el
  // índice activo visible (cierre por tap-fuera o moviéndose a otro índice).
  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    isDownRef.current = false;
  }, []);

  // Cancelación del gesto: ocurre cuando el navegador decide quedarse el gesto
  // para hacer SCROLL vertical (pan-y → pointercancel). Soltamos el dedo y
  // limpiamos el índice para ocultar el tooltip que pudo parpadear. Esta es justo
  // la pieza que permite el scroll vertical sin secuestro.
  const onPointerCancel = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    isDownRef.current = false;
    setActive(null);
  }, []);

  // Teclado (mejora barata): ←/→ mueven con clamp 0..count-1, Escape limpia.
  // Desde null: Right→0, Left→count-1.
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const clamp = (i: number) => Math.max(0, Math.min(count - 1, i));
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActive((prev) => (prev == null ? 0 : clamp(prev + 1)));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActive((prev) => (prev == null ? count - 1 : clamp(prev - 1)));
      } else if (e.key === 'Escape') {
        setActive(null);
      }
    },
    [count],
  );

  const onBlur = useCallback(() => {
    setActive(null);
  }, []);

  // Tap-fuera (táctil): cierra si la pulsación cae fuera del contenedor.
  useEffect(() => {
    if (active == null) return;
    const onDocPointerDown = (e: PointerEvent) => {
      const el = containerRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        setActive(null);
      }
    };
    document.addEventListener('pointerdown', onDocPointerDown);
    return () => document.removeEventListener('pointerdown', onDocPointerDown);
  }, [active]);

  return {
    active,
    setActive,
    containerRef,
    handlers: {
      onPointerMove,
      onPointerLeave,
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      onKeyDown,
      onBlur,
    },
  };
}
