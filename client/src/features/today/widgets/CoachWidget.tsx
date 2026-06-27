import { Fragment, type ReactNode } from 'react';
import { Widget } from './Widget';
import type { CoachData } from '../data';

// Widget Coach IA (DESIGN.md §7c): ÚNICA superficie con el gradiente IA.
// Superficie --surface-2, barra superior 3px con --ai-grad, badge con texto en
// gradiente (background-clip:text) + LED pulsante (2.6s), título, plan del día y
// chips de datos en mono. El rol llega del user real (auth), no del mock.

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
      // Barra superior 3px con el gradiente IA (pseudo-elemento ::before via clase).
      className="sp-coach !bg-surface-2"
    >
      <span className="disp mb-[12px] inline-flex items-center gap-2 self-start bg-ai-grad bg-clip-text text-[11px] font-bold tracking-[0.02em] text-transparent">
        <span className="sp-led h-[7px] w-[7px] rounded-full bg-ai-grad" aria-hidden="true" />
        COACH IA · {roleLabel.toUpperCase()}
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
