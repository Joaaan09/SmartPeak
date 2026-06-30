import type { ActiveEnergyHour, StepsHour } from '../types';
import { formatHourLabel, formatInteger, hourFromT } from '../format';
import { DetailStats } from './DetailStats';
import { ChartTooltip } from './ChartTooltip';
import { useHourScrubber } from './useHourScrubber';

// Gráfica de barras por hora para métricas ACUMULATIVAS (pasos · energía).
//
// Dibuja un SVG hecho a mano (como TrendWidget, preserveAspectRatio:none) con
// una barra por hora en el eje 00–23. La serie puede ser dispersa: se rellenan
// 24 slots a 0, así una hora sin dato se ve como hueco (barra a 0). El PICO del
// día va a opacidad plena, el resto atenuado. Eje X con pocos ticks en mono
// (00·06·12·18·23) como fila de labels HTML debajo del SVG (no dentro: el
// preserveAspectRatio:none deformaría el texto). Debajo, una fila <DetailStats>
// (PICO · MEDIA/HORA ACT. · HORAS ACT.) como equivalente textual en el DOM.

export interface HourlyBarChartProps {
  /** Serie horaria (pasos o energía); ausente si el sync no trajo intradía. */
  hourly?: StepsHour[] | ActiveEnergyHour[];
  /** Token de color del dato (p. ej. "var(--m-steps)"). */
  colorVar: string;
  /** Unidad del total para el equivalente textual (p. ej. "pasos", "kcal"). */
  unitTotal: string;
}

// Geometría del viewBox (escalado por preserveAspectRatio:none).
const VIEW_W = 240;
const VIEW_H = 100;
const BAR_GAP = 1; // hueco lateral entre barras, en unidades de viewBox
// Ticks del eje X (pocos, en mono) — DESIGN.md §12.
const X_TICKS = [0, 6, 12, 18, 23];

/** Lee la cantidad de un tramo soportando la unión pasos|energía. */
function quantityOf(p: StepsHour | ActiveEnergyHour): number {
  return 'qty' in p ? p.qty : p.kcal;
}

export function HourlyBarChart({ hourly, colorVar, unitTotal }: HourlyBarChartProps) {
  const scrubber = useHourScrubber();

  // 24 slots (horas 0–23) a 0; cada tramo se vuelca en su hora vía hourFromT.
  const slots = new Array<number>(24).fill(0);
  if (hourly) {
    for (const p of hourly) slots[hourFromT(p.t)] += quantityOf(p);
  }

  const total = slots.reduce((acc, v) => acc + v, 0);
  const max = Math.max(...slots);
  const peakHour = slots.indexOf(max);
  const activeHours = slots.filter((v) => v > 0).length;
  const avgPerActive = activeHours > 0 ? total / activeHours : 0;

  // Caso borde: sin desglose por horas → nota sobria (no null en silencio).
  if (!hourly || hourly.length === 0 || total === 0) {
    return (
      <div
        className="rounded-r border border-line bg-surface px-[18px] py-[16px]"
        role="img"
        aria-label={`Sin desglose por horas para hoy (${formatInteger(total)} ${unitTotal} en total).`}
      >
        <p className="mono text-[12px] tracking-[0.04em] text-text-faint">
          Sin desglose por horas para hoy.
        </p>
      </div>
    );
  }

  // Ancho de cada celda y de la barra dentro de ella (24 columnas).
  const cellW = VIEW_W / 24;
  const barW = cellW - BAR_GAP;

  const { active } = scrubber;
  // Hora resaltada: la activa (scrubber) manda sobre el pico por defecto.
  const highlightHour = active != null ? active : peakHour;
  // x del centro de la hora activa, en % del ancho (para anclar el tooltip/guía).
  const activeXPct = active != null ? ((active + 0.5) / 24) * 100 : 0;

  const ariaLabel = `Desglose por horas: ${formatInteger(total)} ${unitTotal} en total, pico de ${formatInteger(max)} a las ${formatHourLabel(peakHour)}:00. Usa las flechas para recorrer las horas.`;

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
          {/* Guía vertical sutil sobre la hora activa (chrome monocromo). */}
          {active != null && (
            <line
              x1={active * cellW + cellW / 2}
              y1="0"
              x2={active * cellW + cellW / 2}
              y2={VIEW_H}
              stroke="var(--line-strong)"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
          )}
          {slots.map((v, hour) => {
            const h = max > 0 ? (v / max) * (VIEW_H - 2) : 0;
            const x = hour * cellW + BAR_GAP / 2;
            // Opacidad plena para la hora resaltada con dato; el resto atenuado.
            const isLit = hour === highlightHour && (active != null || v > 0);
            return (
              <rect
                key={hour}
                className="sp-chart-in"
                style={{ ['--i' as string]: hour }}
                x={x}
                y={VIEW_H - h}
                width={barW}
                height={h}
                fill={colorVar}
                opacity={isLit ? 1 : 0.5}
                rx="0.5"
              />
            );
          })}
        </svg>

        {/* Tooltip bajo demanda (hover/tap): hora + valor de esa hora. */}
        {active != null && (
          <ChartTooltip
            xPct={activeXPct}
            label={`${formatHourLabel(active)}:00`}
            value={formatInteger(slots[active])}
            unit={unitTotal}
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
            { label: `PICO · ${formatHourLabel(peakHour)}:00`, value: formatInteger(max) },
            { label: 'MEDIA/HORA ACT.', value: formatInteger(avgPerActive) },
            { label: 'HORAS ACT.', value: formatInteger(activeHours) },
          ]}
        />
      </div>
    </div>
  );
}
