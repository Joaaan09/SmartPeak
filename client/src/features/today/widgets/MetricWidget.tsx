import { Widget } from './Widget';
import type { DeltaDirection, MetricData, MetricKey } from '../data';

// Widget de métrica REUTILIZABLE (HRV / RHR / Sueño / Pasos / Peso).
// Mini-anillo con conic-gradient + máscara radial (como .minring del mockup) en
// el color --m-* de la métrica. El valor va en mono con unidad pequeña en
// --text-muted; el delta (↑/↓ %) usa señales semánticas (--pos/--neg/--text-muted).
// El equivalente textual del anillo es la propia cifra, ya en el DOM (a11y §10).

// Métrica → su token de color (--m-*). Cada color SOLO en su métrica (DESIGN.md §3).
const metricColorVar: Record<MetricKey, string> = {
  hrv: 'var(--m-hrv)',
  rhr: 'var(--m-rhr)',
  sleep: 'var(--m-sleep)',
  steps: 'var(--m-steps)',
  weight: 'var(--m-weight)',
};

// Dirección del delta → color de señal + glifo.
const deltaMeta: Record<
  DeltaDirection,
  { colorVar: string; glyph: string }
> = {
  up: { colorVar: 'var(--pos)', glyph: '↑' },
  down: { colorVar: 'var(--neg)', glyph: '↓' },
  flat: { colorVar: 'var(--text-muted)', glyph: '' },
};

export function MetricWidget({
  data,
  index = 0,
}: {
  data: MetricData;
  index?: number;
}) {
  const delta = deltaMeta[data.delta.direction];
  const ringColor = metricColorVar[data.key];

  return (
    <Widget
      span="3"
      index={index}
      ariaLabel={`${data.label}: ${data.value}${data.unit ? ' ' + data.unit : ''}`}
      // --ring + --p alimentan el conic-gradient del mini-anillo (ver clase sp-minring).
      style={{
        ['--ring' as string]: ringColor,
        ['--p' as string]: data.ringPct,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="disp text-[12px] font-semibold uppercase tracking-[0.01em] text-text-muted">
          {data.label}
        </span>
        <span
          className="mono inline-flex items-center gap-[3px] text-[12px] font-bold"
          style={{ color: delta.colorVar }}
        >
          {delta.glyph && <span aria-hidden="true">{delta.glyph}</span>}
          {data.delta.label}
        </span>
      </div>

      <div className="mt-[14px] flex items-center gap-[15px] lg:mt-auto">
        <span className="sp-minring" aria-hidden="true" />
        <span className="flex min-w-0 flex-col">
          <span className="mono text-[27px] font-bold leading-[1.05] tracking-[-0.02em] text-text">
            {data.value}
            {data.unit && (
              <i className="ml-[3px] font-body text-[13px] font-medium not-italic text-text-muted">
                {data.unit}
              </i>
            )}
          </span>
          <span className="disp mt-[4px] text-[11.5px] text-text-faint">
            {data.caption}
          </span>
        </span>
      </div>
    </Widget>
  );
}
