import { useId } from 'react';
import type { HeartRateSample } from '../types';
import { formatHourLabel, formatInteger, hourFromT } from '../format';
import { DetailStats } from './DetailStats';
import { ChartTooltip } from './ChartTooltip';
import { useHourScrubber } from './useHourScrubber';

// Gráfica de FC del día: banda mín–máx + línea de media.
//
// Dibuja un SVG hecho a mano (como TrendWidget, preserveAspectRatio:none): una
// banda (path cerrado: máximos hacia delante + mínimos hacia atrás) rellena en
// `colorVar` a baja opacidad con gradiente (useId), y una polyline de la media
// por encima. La serie puede ser dispersa: solo se conectan los samples
// presentes en orden (sin inventar puntos en los huecos). X = hora (0–23),
// Y = bpm escalado entre el mín y el máx globales del día con padding. Eje X con
// pocos ticks en mono debajo del SVG. Debajo, <DetailStats> (MÍN · MEDIA · MÁX)
// como equivalente textual en el DOM.

export interface HeartRateChartProps {
  /** Serie horaria de FC; ausente si el sync no trajo intradía. */
  samples?: HeartRateSample[];
  /** Token de color del dato (p. ej. "var(--m-rhr)"). */
  colorVar: string;
}

// Geometría del viewBox (escalado por preserveAspectRatio:none).
const VIEW_W = 240;
const VIEW_H = 100;
const PAD_Y = 6; // margen vertical en unidades de viewBox
const X_TICKS = [0, 6, 12, 18, 23];

/** Punto resuelto de un sample (min/avg/max ya con fallbacks). */
interface Point {
  hour: number;
  min: number;
  avg: number;
  max: number;
}

export function HeartRateChart({ samples, colorVar }: HeartRateChartProps) {
  const gradId = useId();
  const scrubber = useHourScrubber();

  // Resuelve cada sample a min/avg/max con fallbacks robustos.
  const points: Point[] = (samples ?? []).map((s) => {
    const hasMin = s.min != null;
    const hasMax = s.max != null;
    // Si falta min o max, se aproximan al avg (o entre sí) para no romper la banda.
    const avgGuess = s.avg ?? (hasMin && hasMax ? (s.min! + s.max!) / 2 : (s.min ?? s.max ?? 0));
    const min = s.min ?? Math.min(avgGuess, s.max ?? avgGuess);
    const max = s.max ?? Math.max(avgGuess, s.min ?? avgGuess);
    return { hour: hourFromT(s.t), min, avg: s.avg ?? (min + max) / 2, max };
  });

  // Caso borde: sin samples → nota sobria (no null en silencio).
  if (points.length === 0) {
    return (
      <div
        className="rounded-r border border-line bg-surface px-[18px] py-[16px]"
        role="img"
        aria-label="Sin desglose de frecuencia cardíaca para hoy."
      >
        <p className="mono text-[12px] tracking-[0.04em] text-text-faint">
          Sin desglose de frecuencia cardíaca para hoy.
        </p>
      </div>
    );
  }

  // Extremos globales del día (mín de los mín, máx de los máx).
  const minGlobal = Math.min(...points.map((p) => p.min));
  const maxGlobal = Math.max(...points.map((p) => p.max));
  const avgGlobal =
    points.reduce((acc, p) => acc + p.avg, 0) / points.length;

  // Escala Y con padding; si todo es plano, evita división por cero.
  const range = maxGlobal - minGlobal || 1;
  const toY = (bpm: number) =>
    VIEW_H - PAD_Y - ((bpm - minGlobal) / range) * (VIEW_H - PAD_Y * 2);
  const toX = (hour: number) => (hour / 23) * VIEW_W;

  const maxLine = points.map((p) => `${toX(p.hour)},${toY(p.max)}`).join(' ');
  const minLineRev = [...points]
    .reverse()
    .map((p) => `${toX(p.hour)},${toY(p.min)}`)
    .join(' ');
  // Banda cerrada: máximos hacia delante + mínimos hacia atrás.
  const bandPath = `M${maxLine} L${minLineRev} Z`;
  const avgLine = points.map((p) => `${toX(p.hour)},${toY(p.avg)}`).join(' ');

  // Sample real más cercano a la hora del scrubber: los samples son dispersos,
  // así el tooltip/guía caen SIEMPRE sobre dato real (no sobre un hueco).
  const { active } = scrubber;
  const activePoint =
    active == null
      ? null
      : points.reduce((best, p) =>
          Math.abs(p.hour - active) < Math.abs(best.hour - active) ? p : best,
        );
  // xPct anclado al MISMO mapeo X que el punto/guía (toX → hour/23), para que el
  // tooltip quede centrado sobre su punto también en las horas de los bordes.
  const activeXPct = activePoint != null ? (toX(activePoint.hour) / VIEW_W) * 100 : 0;

  const ariaLabel = `Frecuencia cardíaca del día: mínimo ${formatInteger(minGlobal)}, media ${formatInteger(avgGlobal)}, máximo ${formatInteger(maxGlobal)} bpm. Usa las flechas para recorrer las horas.`;

  return (
    <div className="rounded-r border border-line bg-surface px-[18px] py-[16px]">
      <div
        ref={scrubber.containerRef}
        role="img"
        aria-label={ariaLabel}
        tabIndex={0}
        className="sp-chart-scrub relative min-h-[120px] rounded-r-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        onPointerMove={scrubber.handlers.onPointerMove}
        onPointerLeave={scrubber.handlers.onPointerLeave}
        onPointerDown={scrubber.handlers.onPointerDown}
        onPointerUp={scrubber.handlers.onPointerUp}
        onPointerCancel={scrubber.handlers.onPointerCancel}
        onKeyDown={scrubber.handlers.onKeyDown}
        onBlur={scrubber.handlers.onBlur}
      >
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          className="block h-[120px] w-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={colorVar} stopOpacity="0.22" />
              <stop offset="1" stopColor={colorVar} stopOpacity="0.08" />
            </linearGradient>
          </defs>
          {/* Líneas guía sutiles (chrome monocromo), como TrendWidget. */}
          <line
            x1="0"
            y1={VIEW_H - 1}
            x2={VIEW_W}
            y2={VIEW_H - 1}
            stroke="var(--line)"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1={VIEW_H / 2}
            x2={VIEW_W}
            y2={VIEW_H / 2}
            stroke="var(--line)"
            strokeWidth="1"
            strokeDasharray="3 6"
          />
          {/* Guía vertical sobre la hora activa (chrome monocromo). */}
          {activePoint != null && (
            <line
              x1={toX(activePoint.hour)}
              y1="0"
              x2={toX(activePoint.hour)}
              y2={VIEW_H}
              stroke="var(--line-strong)"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
          )}
          {/* Banda mín–máx (área a baja opacidad). */}
          <path className="sp-chart-in" d={bandPath} fill={`url(#${gradId})`} />
          {/* Línea de media. */}
          <polyline
            className="sp-chart-in"
            style={{ ['--i' as string]: 1 }}
            fill="none"
            stroke={colorVar}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={avgLine}
          />
        </svg>

        {/* Punto sobre el avg de la hora activa (HTML, no SVG: preserveAspectRatio
            :none deformaría un <circle> en elipse). Posición en % sobre el SVG. */}
        {activePoint != null && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute z-[1] h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface"
            style={{
              left: `${(toX(activePoint.hour) / VIEW_W) * 100}%`,
              top: `${(toY(activePoint.avg) / VIEW_H) * 120}px`,
              background: colorVar,
            }}
          />
        )}

        {/* Tooltip bajo demanda (hover/tap): hora + avg bpm, con mín–máx debajo. */}
        {activePoint != null && (
          <ChartTooltip
            xPct={activeXPct}
            label={`${formatHourLabel(activePoint.hour)}:00`}
            value={formatInteger(activePoint.avg)}
            unit="bpm"
            sub={`mín ${formatInteger(activePoint.min)} · máx ${formatInteger(activePoint.max)}`}
            colorVar={colorVar}
          />
        )}

        {/* Eje X: pocos ticks en mono, repartidos (HTML, no SVG). */}
        <div className="mt-[6px] flex justify-between" aria-hidden="true">
          {X_TICKS.map((hour) => (
            <span key={hour} className="mono text-[9px] tracking-[0.04em] text-text-faint">
              {formatHourLabel(hour)}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-[18px]">
        <DetailStats
          colorVar={colorVar}
          stats={[
            { label: 'MÍN', value: formatInteger(minGlobal), unit: 'bpm' },
            { label: 'MEDIA', value: formatInteger(avgGlobal), unit: 'bpm' },
            { label: 'MÁX', value: formatInteger(maxGlobal), unit: 'bpm' },
          ]}
        />
      </div>
    </div>
  );
}
