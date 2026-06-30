// Tooltip interactivo de las gráficas del desglose (DESIGN.md §12b).
//
// Burbuja reutilizable, posicionada en ABSOLUTO dentro de un contenedor con
// `position:relative` (la propia gráfica). Aparece BAJO DEMANDA: hover en
// desktop, tap en móvil (lo gestiona el scrubber/handler del padre). Es MEJORA
// PROGRESIVA: el equivalente textual ya vive en el DOM (cifra-héroe +
// DetailStats), así que el tooltip es `aria-hidden` y `pointer-events:none`.
//
// Estilo: superficie elevada (--surface-2 + borde --line + --shadow), label
// (hora/fase) en mono atenuado y valor en mono `tabular-nums` coloreado con el
// --m-* de la métrica. Motion de entrada fade + scale(0.96→1) <200ms vía
// `.sp-tooltip-in` (apagado bajo prefers-reduced-motion).
//
// CLAMP horizontal: la burbuja se ancla en `xPct` (centro), pero se acota con
// `left: clamp(...)` para que sus bordes (estimados con --tt-half = mitad del
// ancho máximo) NUNCA se salgan del contenedor; a 375px queda siempre visible.

export interface ChartTooltipProps {
  /** Centro horizontal donde anclar, en % del contenedor (0–100). */
  xPct: number;
  /** Label (hora "HH:00" o nombre de fase) en mono atenuado. */
  label: string;
  /** Valor ya formateado (mono tabular-nums, coloreado con colorVar). */
  value: string;
  /** Unidad pequeña opcional pegada al valor (en --text-muted). */
  unit?: string;
  /** Subtexto opcional bajo el valor (p. ej. "mín–máx" de FC), en mono atenuado. */
  sub?: string;
  /** Token de color del dato (p. ej. "var(--m-steps)"). */
  colorVar: string;
}

// Ancho máximo de la burbuja (px). La mitad sirve para acotar el centro y que
// los bordes no se salgan del contenedor (clamp horizontal con CSS puro).
const MAX_W = 132;
const HALF = MAX_W / 2;

export function ChartTooltip({ xPct, label, value, unit, sub, colorVar }: ChartTooltipProps) {
  return (
    <div
      aria-hidden="true"
      className="sp-tooltip-in pointer-events-none absolute bottom-full z-10 mb-[8px] -translate-x-1/2"
      style={{
        // Centro acotado: nunca menos de HALFpx ni más de (100% - HALFpx), así
        // los bordes de la burbuja quedan dentro del contenedor a cualquier ancho.
        left: `clamp(${HALF}px, ${xPct}%, calc(100% - ${HALF}px))`,
        maxWidth: `${MAX_W}px`,
      }}
    >
      <div className="rounded-r-sm border border-line bg-surface-2 px-[10px] py-[7px] shadow-token">
        <p className="mono whitespace-nowrap text-[10px] leading-none tracking-[0.04em] text-text-muted">
          {label}
        </p>
        <p
          className="mono mt-[3px] whitespace-nowrap text-[16px] font-bold leading-none tracking-[-0.01em]"
          style={{ color: colorVar }}
        >
          {value}
          {unit && (
            <i className="ml-[3px] font-body text-[11px] font-medium not-italic text-text-muted">
              {unit}
            </i>
          )}
        </p>
        {sub && (
          <p className="mono mt-[3px] whitespace-nowrap text-[10px] leading-none tracking-[0.04em] text-text-muted">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
