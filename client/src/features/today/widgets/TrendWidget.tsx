import { useId } from 'react';
import { Widget } from './Widget';
import type { DeltaDirection, TrendData } from '../data';

// Widget de tendencia (DESIGN.md §7): gráfico SVG de línea + área (HRV 7 días)
// en --m-hrv, como el mockup (viewBox 0..600/0..110, preserveAspectRatio:none,
// gradiente de relleno con opacidad, línea, punto final). El color vive solo en
// el dato; el equivalente textual es la etiqueta + delta, ya en el DOM.

const deltaColor: Record<DeltaDirection, string> = {
  up: 'var(--pos)',
  down: 'var(--neg)',
  flat: 'var(--text-muted)',
};

const deltaGlyph: Record<DeltaDirection, string> = {
  up: '↑',
  down: '↓',
  flat: '',
};

export function TrendWidget({
  data,
  index = 0,
}: {
  data: TrendData;
  index?: number;
}) {
  // useId evita colisiones del id del gradiente si hubiera varios TrendWidget.
  const gradId = useId();
  const pts = data.points;

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(' ');
  // Área: misma línea cerrada por abajo (hasta y=110) y vuelta al origen.
  const first = pts[0];
  const last = pts[pts.length - 1];
  const areaPath = `M${polyline} V110 H${first.x} Z`;

  const color = deltaColor[data.delta.direction];
  const glyph = deltaGlyph[data.delta.direction];

  return (
    <Widget span="8" index={index} ariaLabel={data.label}>
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow text-[10.5px]">{data.label}</span>
        <span
          className="mono inline-flex items-center gap-[3px] text-[12px] font-bold"
          style={{ color }}
        >
          {glyph && <span aria-hidden="true">{glyph}</span>}
          {data.delta.label}
        </span>
      </div>

      <div className="mt-[12px] min-h-[120px] flex-1">
        <svg
          viewBox="0 0 600 110"
          preserveAspectRatio="none"
          className="block h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--m-hrv)" stopOpacity="0.18" />
              <stop offset="1" stopColor="var(--m-hrv)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Líneas guía sutiles (chrome monocromo). */}
          <line x1="0" y1="92" x2="600" y2="92" stroke="var(--line)" strokeWidth="1" />
          <line
            x1="0"
            y1="55"
            x2="600"
            y2="55"
            stroke="var(--line)"
            strokeWidth="1"
            strokeDasharray="3 6"
          />
          <path d={areaPath} fill={`url(#${gradId})`} />
          <polyline
            fill="none"
            stroke="var(--m-hrv)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={polyline}
          />
          <circle cx={last.x} cy={last.y} r="4" fill="var(--m-hrv)" />
        </svg>
      </div>
    </Widget>
  );
}
