import type { ReadinessState } from '../features/today/data';

// Readiness compacto del rail (DESIGN.md §6/§7): ancla de identidad de la nav.
// Número mono + label "RDY" + mini-barra cuyo color refleja el ESTADO (igual que
// el anillo grande, decisión 2026-06-29): verde/ámbar/rojo. La nav la firma este
// componente, no un logo. Presente en toda la app (vive en el rail del shell).

const stateColor: Record<ReadinessState, string> = {
  recovered: 'var(--pos)',
  moderate: 'var(--warn)',
  fatigue: 'var(--neg)',
};

export function CompactReadiness({
  score,
  state,
}: {
  score: number;
  state: ReadinessState;
}) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div
      role="img"
      className="mb-[10px] flex flex-col items-center gap-[2px] border-b border-line px-0 pb-[14px] pt-[4px]"
      aria-label={`Readiness ${score} de 100`}
    >
      <span className="mono text-[22px] font-bold leading-none text-text">
        {score}
      </span>
      <span className="eyebrow text-[8.5px] tracking-[0.14em] !text-text-faint">
        RDY
      </span>
      <span className="relative mt-[5px] h-[4px] w-[28px] rounded-full bg-ring-track">
        <i
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pct}%`, background: stateColor[state] }}
        />
      </span>
    </div>
  );
}
