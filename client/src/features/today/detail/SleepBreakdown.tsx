import { useCallback, useMemo } from 'react';
import type { SleepMetric } from '../types';
import { formatHours } from '../format';
import { ChartTooltip } from './ChartTooltip';
import { usePointerScrub } from './usePointerScrub';

// Desglose de sueño (NO hay serie horaria): barra de fases apilada + lista.
//
// Dibuja una barra horizontal apilada con un segmento por fase presente
// (profundo / REM / ligero / despierto), ancho proporcional a su duración sobre
// la suma de las fases presentes. Las fases se diferencian por OPACIDAD de
// --m-sleep (despierto en --ring-track, neutro). Debajo, la lista de fases con
// su punto de color (leyenda), duración (formatHours) y % del denominador, y
// una fila inicio → fin (sleepStart/sleepEnd). El total ya va en la cifra-héroe.
//
// El gesto (hover desktop · tap/arrastre móvil · teclado) lo gobierna el hook
// compartido `usePointerScrub` sobre el contenedor de la barra (un único
// elemento enfocable, sin <button> por fase): así no se duplica la mecánica de
// scrub y NO se captura el puntero (touch-action: pan-y arbitra el scroll
// vertical). DESIGN.md §12b.

export interface SleepBreakdownProps {
  /** Métrica de sueño del DTO; puede faltar (entonces no hay desglose). */
  sleep?: SleepMetric;
}

// Fases en orden de presentación (de más profundo a despierto) + su estilo.
// La opacidad codifica la profundidad sobre --m-sleep; "despierto" es neutro.
const PHASES = [
  { key: 'deep', label: 'Profundo', swatch: 'var(--m-sleep)', opacity: 1 },
  { key: 'rem', label: 'REM', swatch: 'var(--m-sleep)', opacity: 0.72 },
  { key: 'core', label: 'Ligero', swatch: 'var(--m-sleep)', opacity: 0.46 },
  { key: 'awake', label: 'Despierto', swatch: 'var(--ring-track)', opacity: 1 },
] as const;

/**
 * Extrae "HH:MM" de una hora de sueño robustamente: si ya viene "HH:MM[...]" lo
 * usa tal cual; si es un ISO/fecha parseable, formatea su hora local. Devuelve
 * null si no hay nada útil.
 */
function toHourMinute(raw?: string): string | null {
  if (!raw) return null;
  // Ya viene como "HH:MM" (posible sufijo de segundos): cógelo directo.
  const direct = raw.match(/^(\d{2}):(\d{2})/);
  if (direct) return `${direct[1]}:${direct[2]}`;
  // Si no, intenta parsearlo como fecha (ISO) y formatea HH:MM locales.
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  return null;
}

// Formateador de porcentajes en español (sin decimales).
const pctFmt = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 });

export function SleepBreakdown({ sleep }: SleepBreakdownProps) {
  // Fases presentes (>0) en orden + denominador (suma). Memoizado para estabilizar
  // las dependencias del pickIndex y respetar el orden de los hooks (los return
  // tempranos van DESPUÉS de llamar a usePointerScrub).
  const { present, denom } = useMemo(() => {
    if (!sleep || sleep.total == null) return { present: [], denom: 0 };
    const list = PHASES.map((p) => ({ ...p, hours: sleep[p.key] ?? 0 })).filter(
      (p) => p.hours > 0,
    );
    return { present: list, denom: list.reduce((acc, p) => acc + p.hours, 0) };
  }, [sleep]);

  const pctOf = useCallback(
    (hours: number) => (denom > 0 ? (hours / denom) * 100 : 0),
    [denom],
  );

  // Mapea un clientX al índice de la fase BAJO el dedo según los anchos
  // ACUMULADOS (cada fase ocupa pctOf(hours)% del ancho). Clamp al último índice.
  const pickPhase = useCallback(
    (clientX: number, rect: DOMRect) => {
      const ratioPct = ((clientX - rect.left) / rect.width) * 100;
      let acc = 0;
      for (let i = 0; i < present.length; i++) {
        acc += pctOf(present[i].hours);
        if (ratioPct < acc) return i;
      }
      return Math.max(0, present.length - 1);
    },
    [present, pctOf],
  );

  // Scrub compartido sobre la barra de fases (count = nº de fases presentes).
  const { active, containerRef, handlers } = usePointerScrub(pickPhase, present.length);

  // Centro horizontal de cada segmento (en % del ancho) para anclar el tooltip:
  // suma de anchos previos + medio ancho propio. Memoizado.
  const segmentCenters = useMemo(
    () =>
      present.map((p, i) => {
        const before = present
          .slice(0, i)
          .reduce((acc, q) => acc + pctOf(q.hours), 0);
        return before + pctOf(p.hours) / 2;
      }),
    [present, pctOf],
  );

  if (!sleep || sleep.total == null) return null;

  const start = toHourMinute(sleep.sleepStart);
  const end = toHourMinute(sleep.sleepEnd);

  // Caso borde: solo total, ninguna fase → nota sobria.
  if (present.length === 0 || denom === 0) {
    return (
      <div
        className="rounded-r border border-line bg-surface px-[18px] py-[16px]"
        role="img"
        aria-label={`Sin fases de sueño para hoy (${formatHours(sleep.total)} en total).`}
      >
        <p className="mono text-[12px] tracking-[0.04em] text-text-faint">
          Sin fases de sueño para hoy.
        </p>
      </div>
    );
  }

  const ariaLabel = `Fases del sueño: ${present
    .map((p) => `${p.label} ${formatHours(p.hours)}`)
    .join(', ')}. Usa las flechas para recorrer las fases.`;

  return (
    <div className="rounded-r border border-line bg-surface px-[18px] py-[16px]">
      {/* Barra de fases apilada (color SOLO en el dato; despierto neutro). Es un
          ÚNICO contenedor enfocable que gobierna hover/tap/arrastre/teclado vía
          usePointerScrub (sin <button> por fase → sin doble-toggle ni captura de
          puntero). El padding vertical transparente (py-[14px]) agranda el área
          táctil a ~44px sin mover visualmente la barra de 16px. .sp-chart-scrub
          evita selección/callout y deja que touch-action: pan-y arbitre el scroll
          vertical de la página (DESIGN.md §12b). */}
      <div className="relative">
        <div
          ref={containerRef}
          className="sp-chart-scrub relative w-full rounded-[2px] py-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          role="img"
          aria-label={ariaLabel}
          tabIndex={0}
          onPointerMove={handlers.onPointerMove}
          onPointerLeave={handlers.onPointerLeave}
          onPointerDown={handlers.onPointerDown}
          onPointerUp={handlers.onPointerUp}
          onPointerCancel={handlers.onPointerCancel}
          onKeyDown={handlers.onKeyDown}
          onBlur={handlers.onBlur}
        >
          <div
            className="flex h-[16px] w-full overflow-hidden rounded-full"
            aria-hidden="true"
          >
            {present.map((p, i) => (
              <span
                key={p.key}
                className="sp-chart-in block h-full transition-opacity duration-150 ease-out-ui"
                style={{
                  width: `${pctOf(p.hours)}%`,
                  background: p.swatch,
                  // La fase activa va a opacidad plena; el resto, su opacidad base
                  // atenuada cuando hay una activa distinta.
                  opacity: active != null && active !== i ? p.opacity * 0.5 : p.opacity,
                  ['--i' as string]: i,
                }}
              />
            ))}
          </div>
        </div>

        {/* Tooltip de la fase activa: nombre + duración + %. "Despierto" usa
            --ring-track (neutro, ilegible como cifra) → se cae a --text. */}
        {active != null && present[active] && (
          <ChartTooltip
            xPct={segmentCenters[active]}
            label={present[active].label}
            value={formatHours(present[active].hours)}
            sub={`${pctFmt.format(pctOf(present[active].hours))}%`}
            colorVar={
              present[active].swatch === 'var(--ring-track)'
                ? 'var(--text)'
                : present[active].swatch
            }
          />
        )}
      </div>

      {/* Lista de fases con leyenda de color + duración + %. */}
      <dl className="mt-[18px] flex flex-col gap-[10px]">
        {present.map((p) => (
          <div key={p.key} className="flex items-center justify-between gap-[12px]">
            <dt className="flex items-center gap-[8px]">
              <span
                aria-hidden="true"
                className="h-[10px] w-[10px] flex-shrink-0 rounded-[3px]"
                style={{ background: p.swatch, opacity: p.opacity }}
              />
              <span className="font-body text-[13px] font-medium text-text">{p.label}</span>
            </dt>
            <dd className="flex items-baseline gap-[10px]">
              <span className="mono text-[14px] font-bold tracking-[-0.01em] text-text">
                {formatHours(p.hours)}
              </span>
              <span className="mono w-[40px] text-right text-[12px] text-text-muted">
                {pctFmt.format(pctOf(p.hours))}%
              </span>
            </dd>
          </div>
        ))}
      </dl>

      {/* Fila inicio → fin (si hay datos), en mono atenuado. */}
      {start && end && (
        <p className="mt-[16px] border-t border-line pt-[12px] mono text-[12px] tracking-[0.04em] text-text-muted">
          {start} <span aria-hidden="true">→</span>{' '}
          <span className="sr-only">a</span> {end}
        </p>
      )}
    </div>
  );
}
