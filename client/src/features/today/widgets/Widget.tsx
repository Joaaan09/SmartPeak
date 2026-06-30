import type { CSSProperties, ReactNode } from 'react';

// Primitiva base de TODO widget del dashboard Hoy.
// Aporta el chrome común (DESIGN.md §4): superficie, borde 1px, radio --r, luz
// superior de 1px (--hi) y sombra del tema. También la entrada escalonada
// (stagger §8) vía la variable --i (índice del widget), que la keyframe `win`
// del index.css consume.
//
// Arquitectura lista para el modo edición (otra iteración): cuando llegue,
// envolverá aquí las manijas (quitar / mover / resize) y el jiggle, sin tocar
// el contenido de cada widget. Por eso el chrome vive en este único sitio.

/** Tamaños discretos en la rejilla bento de 12 columnas (DESIGN.md §5). */
export type WidgetSpan = '5x2' | '4x2' | '3' | '8' | '4';

// Mobile-first: el contenedor es un grid de 2 columnas en móvil y de 12 en lg+.
// Por defecto cada widget ocupa las 2 columnas (ancho completo) en móvil; las
// métricas (span 3) ocupan 1 columna → 2 por fila. En lg+ cada widget adopta su
// span del bento, con grid-auto-flow:dense (lo aplica el contenedor en TodayPage).
const spanClasses: Record<WidgetSpan, string> = {
  '5x2': 'col-span-2 lg:col-span-5 lg:row-span-2',
  '4x2': 'col-span-2 lg:col-span-4 lg:row-span-2',
  '3': 'col-span-1 lg:col-span-3',
  '8': 'col-span-2 lg:col-span-8',
  '4': 'col-span-2 lg:col-span-4',
};

interface WidgetProps {
  span: WidgetSpan;
  /** Índice para el stagger de entrada (--i). */
  index?: number;
  /** Etiqueta accesible del widget como región. */
  ariaLabel: string;
  /** Marca el widget como no operable (estado "próximamente"). */
  ariaDisabled?: boolean;
  /** Clases extra (alineación interna, variantes como el coach). */
  className?: string;
  /** Estilo extra (p. ej. --ring / --p del anillo de métrica). */
  style?: CSSProperties;
  children: ReactNode;
}

export function Widget({
  span,
  index = 0,
  ariaLabel,
  ariaDisabled,
  className = '',
  style,
  children,
}: WidgetProps) {
  return (
    <section
      aria-label={ariaLabel}
      aria-disabled={ariaDisabled || undefined}
      className={[
        'sp-widget relative flex min-w-0 flex-col overflow-hidden rounded-r',
        'border border-line bg-surface px-[18px] py-[16px]',
        'shadow-[var(--shadow),inset_0_1px_0_var(--hi)]',
        spanClasses[span],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ['--i' as string]: index, ...style }}
    >
      {children}
    </section>
  );
}
