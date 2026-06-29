import { Fragment, type ReactNode } from 'react';
import { Widget } from './Widget';
import type { CoachData } from '../data';

// Widget Coach IA (DESIGN.md §7c) — MONOCROMO (decisión 2026-06-29, como la
// landing): superficie elevada --surface-2, eyebrow técnico en Space Mono con un
// LED neutro que respira (2.6s) para señalar "inteligente" sin teñir la app,
// título, plan del día y chips de datos en mono. El rol llega del user real
// (auth), no del mock.

// Resalta los tramos **...** del cuerpo en --text (negrita semántica del plan).
function renderBody(body: string): ReactNode {
  // Divide por pares de asteriscos; los índices impares son los resaltados.
  return body.split('**').map((part, i) =>
    i % 2 === 1 ? (
      <b key={i} className="font-semibold text-text">
        {part}
      </b>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

export function CoachWidget({
  data,
  roleLabel,
  index = 0,
}: {
  data: CoachData;
  /** Rol legible del user (Powerlifting / Hipertrofia / Salud general). */
  roleLabel: string;
  index?: number;
}) {
  return (
    <Widget
      span="4x2"
      index={index}
      ariaLabel={`Coach IA, ${roleLabel}: ${data.title}`}
      className="!bg-surface-2"
    >
      <span className="eyebrow mb-[12px] inline-flex items-center gap-2 self-start text-[11px]">
        <span className="sp-led h-[7px] w-[7px] rounded-full bg-text-muted" aria-hidden="true" />
        Coach IA · {roleLabel}
      </span>

      <h2 className="disp mb-[8px] text-[16px] font-semibold tracking-[-0.01em] text-text">
        {data.title}
      </h2>
      <p className="font-body text-[14px] leading-[1.55] text-text-muted">
        {renderBody(data.body)}
      </p>

      <div className="mt-auto flex flex-wrap gap-2 pt-[14px]">
        {data.chips.map((chip) => (
          <span
            key={chip.label}
            className="mono rounded-r-sm border border-line bg-surface px-[11px] py-[7px] text-[12.5px]"
          >
            <span className="disp mr-[6px] text-[9px] font-semibold tracking-[0.06em] text-text-muted">
              {chip.label}
            </span>
            {chip.value}
          </span>
        ))}
      </div>
    </Widget>
  );
}
