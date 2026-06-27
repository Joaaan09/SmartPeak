import { Widget } from './Widget';
import { useCountUp } from './useCountUp';
import type { ReadinessData, ReadinessState } from '../data';

// Widget firma (DESIGN.md §7): anillo grande en --m-rdy con count-up del score
// (0→valor, 800ms, ease-out expo) y llenado del anillo en sincronía
// (stroke-dashoffset). La cifra central es NEUTRA (--text): el número se lee, el
// anillo da el color. Reduced-motion → valor final directo (lo gestiona useCountUp).

// Geometría del anillo (idéntica al mockup): r=78 en un viewBox 176×176.
const RADIUS = 78;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 490

// Estado → etiqueta visible (es) + token de señal semántica.
const stateMeta: Record<
  ReadinessState,
  { label: string; colorVar: string }
> = {
  recovered: { label: 'Recuperado', colorVar: 'var(--pos)' },
  moderate: { label: 'Moderado', colorVar: 'var(--warn)' },
  fatigue: { label: 'Fatiga', colorVar: 'var(--neg)' },
};

export function ReadinessWidget({
  data,
  index = 0,
}: {
  data: ReadinessData;
  index?: number;
}) {
  const { progress, value } = useCountUp(data.score, 800);
  const meta = stateMeta[data.state];

  // Llenado del anillo: offset de circunferencia según el progreso del count-up.
  const filled = CIRCUMFERENCE * (data.score / 100) * progress;
  const dashOffset = CIRCUMFERENCE - filled;

  return (
    <Widget
      span="5x2"
      index={index}
      ariaLabel={`Readiness ${data.score} de 100, ${meta.label}`}
      className="items-center justify-center text-center"
    >
      <div className="relative h-[176px] w-[176px]">
        <svg
          width="176"
          height="176"
          viewBox="0 0 176 176"
          className="-rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="88"
            cy="88"
            r={RADIUS}
            fill="none"
            stroke="var(--ring-track)"
            strokeWidth="13"
          />
          <circle
            cx="88"
            cy="88"
            r={RADIUS}
            fill="none"
            stroke="var(--m-rdy)"
            strokeWidth="13"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="mono text-[60px] font-bold leading-none tracking-[-0.03em] text-text">
            {value}
          </span>
          <span className="disp mt-[3px] text-[10px] font-semibold tracking-[0.1em] text-text-faint">
            READINESS / 100
          </span>
        </div>
      </div>

      <div
        className="disp mt-[14px] text-[15px] font-semibold tracking-[0.02em]"
        style={{ color: meta.colorVar }}
      >
        {meta.label}
      </div>
      <p className="mt-[4px] font-body text-[12.5px] text-text-muted">
        {data.sub}
      </p>
    </Widget>
  );
}
