import { Widget } from './Widget';
import { useCountUp } from './useCountUp';
import type { ReadinessData, ReadinessState } from '../types';

// Widget firma (DESIGN.md §7) — ANILLO de progreso cuyo COLOR refleja el ESTADO de
// recuperación (decisión 2026-06-29): verde Recuperado / ámbar Moderado / rojo
// Fatiga. El número central es NEUTRO (--text): el número se lee, el anillo da el
// color (y de un vistazo el color ya dice cómo estás). Count-up + llenado del
// anillo en sincronía (800ms, ease-out expo). Reduced-motion → valor/offset final
// directos (lo gestiona useCountUp).

// Geometría del anillo (idéntica al mockup): r=78 en un viewBox 176×176.
const RADIUS = 78;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 490

// Estado → etiqueta visible (es) + token de señal semántica (el color del anillo).
const stateMeta: Record<ReadinessState, { label: string; colorVar: string }> = {
  recovered: { label: 'Recuperado', colorVar: 'var(--pos)' },
  moderate: { label: 'Moderado', colorVar: 'var(--warn)' },
  fatigue: { label: 'Fatiga', colorVar: 'var(--neg)' },
};

export function ReadinessWidget({
  data,
  comingSoon = false,
  index = 0,
}: {
  /** Datos reales (omitidos en modo próximamente). */
  data?: ReadinessData;
  /** Modo "próximamente": sin cálculo aún (DESIGN.md §11b). */
  comingSoon?: boolean;
  index?: number;
}) {
  if (comingSoon || !data) {
    return (
      <Widget
        span="5x2"
        index={index}
        ariaLabel="Preparación: próximamente"
        ariaDisabled
        className="items-center justify-center text-center opacity-60"
      >
        <div className="relative flex h-[176px] w-[176px] items-center justify-center">
          <span
            className="h-[176px] w-[176px] rounded-full border-[13px] border-ring-track"
            aria-hidden="true"
          />
          <span className="absolute mono text-[60px] font-bold leading-none tracking-[-0.03em] text-text-faint">
            —
          </span>
        </div>
        <div className="mono mt-[14px] text-[10px] font-bold tracking-[0.1em] text-text-faint">
          PRÓXIMAMENTE
        </div>
        <p className="mt-[4px] font-body text-[12.5px] text-text-faint">
          Tu Preparación llegará con el cálculo de Readiness.
        </p>
      </Widget>
    );
  }

  return <ReadinessWidgetData data={data} index={index} />;
}

// Render con dato (mantiene useCountUp fuera de los returns condicionales del
// componente público para no romper las reglas de hooks).
function ReadinessWidgetData({
  data,
  index,
}: {
  data: ReadinessData;
  index: number;
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
            stroke={meta.colorVar}
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
          <span className="eyebrow mt-[4px] text-[10px]">Preparación</span>
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
