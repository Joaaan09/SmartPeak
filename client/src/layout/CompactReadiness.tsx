import type { ReadinessState } from '../features/today/types';

// Readiness compacto del rail (DESIGN.md §6/§7): ancla de identidad de la nav.
// Número mono + label "RDY" + mini-barra cuyo color refleja el ESTADO (igual que
// el anillo grande, decisión 2026-06-29): verde/ámbar/rojo. La nav la firma este
// componente, no un logo. Presente en toda la app (vive en el rail del shell).
//
// El cálculo de Readiness aún no existe (DESIGN.md §11b): mientras no haya score,
// muestra "—" y la barra en --ring-track (sin color de estado), sin inventar dato.

const stateColor: Record<ReadinessState, string> = {
  recovered: 'var(--pos)',
  moderate: 'var(--warn)',
  fatigue: 'var(--neg)',
};

export function CompactReadiness({
  score,
  state,
}: {
  /** Score 0–100; null mientras no haya cálculo de Readiness. */
  score: number | null;
  state?: ReadinessState;
}) {
  const hasScore = score != null && state != null;
  const pct = hasScore ? Math.max(0, Math.min(100, score)) : 0;
  return (
    <div
      role="img"
      className="mb-[10px] flex flex-col items-center gap-[2px] border-b border-line px-0 pb-[14px] pt-[4px]"
      aria-label={
        hasScore ? `Readiness ${score} de 100` : 'Readiness: próximamente'
      }
    >
      <span className="mono text-[22px] font-bold leading-none text-text">
        {hasScore ? score : '—'}
      </span>
      <span className="eyebrow text-[8.5px] tracking-[0.14em] !text-text-faint">
        RDY
      </span>
      <span className="relative mt-[5px] h-[4px] w-[28px] rounded-full bg-ring-track">
        {hasScore && (
          <i
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${pct}%`, background: stateColor[state] }}
          />
        )}
      </span>
    </div>
  );
}
