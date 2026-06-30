import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';

// Primitiva base de TODO widget del dashboard Hoy.
// Aporta el chrome común (DESIGN.md §4): superficie, borde 1px, radio --r, luz
// superior de 1px (--hi) y sombra del tema. También la entrada escalonada
// (stagger §8) vía la variable --i (índice del widget), que la keyframe `win`
// del index.css consume.
//
// Arquitectura lista para el modo edición (otra iteración): cuando llegue,
// envolverá aquí las manijas (quitar / mover / resize) y el jiggle, sin tocar
// el contenido de cada widget. Por eso el chrome vive en este único sitio.
//
// Si recibe `to`, el root se renderiza como <Link> navegable (card clickable,
// DESIGN.md §12): añade los estados de interacción (hover solo en puntero fino,
// :active scale .97, :focus-visible global con --accent) sin tocar el chrome.

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
  /** Si está presente, el root es un <Link> navegable (card clickable, §12). */
  to?: string;
  children: ReactNode;
}

// Chrome común a ambos roots (region y link). En un único sitio (DESIGN.md §4).
const chromeClasses = [
  'sp-widget relative flex min-w-0 flex-col overflow-hidden rounded-r',
  'border border-line bg-surface px-[18px] py-[16px]',
  'shadow-[var(--shadow),inset_0_1px_0_var(--hi)]',
];

// Estados de interacción del root navegable (DESIGN.md §11/§12). Solo
// transform/color/border-color/background-color con --ease-out-ui (nunca
// transition:all): hover SOLO en puntero fino (realce sutil borde+superficie),
// :active scale .97. El :focus-visible global (index.css) ya pinta el outline
// con --accent. El color de la métrica NO se toca: el chrome sigue monocromo.
const linkInteraction = [
  'transition-[transform,border-color,background-color,color] duration-150 ease-out-ui',
  'active:scale-[0.97]',
  '[@media(hover:hover)and(pointer:fine)]:hover:border-line-strong',
  '[@media(hover:hover)and(pointer:fine)]:hover:bg-surface-2',
];

export function Widget({
  span,
  index = 0,
  ariaLabel,
  ariaDisabled,
  className = '',
  style,
  to,
  children,
}: WidgetProps) {
  const widgetStyle = { ['--i' as string]: index, ...style };

  // Card clickable: el root es un <Link>. Mismo chrome + estados de interacción.
  if (to) {
    return (
      <Link
        to={to}
        aria-label={ariaLabel}
        className={[...chromeClasses, ...linkInteraction, spanClasses[span], className]
          .filter(Boolean)
          .join(' ')}
        style={widgetStyle}
      >
        {children}
      </Link>
    );
  }

  return (
    <section
      aria-label={ariaLabel}
      aria-disabled={ariaDisabled || undefined}
      className={[...chromeClasses, spanClasses[span], className]
        .filter(Boolean)
        .join(' ')}
      style={widgetStyle}
    >
      {children}
    </section>
  );
}
