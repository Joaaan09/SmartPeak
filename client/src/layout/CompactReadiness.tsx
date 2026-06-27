// Readiness compacto del rail (DESIGN.md §6/§7): ancla de identidad de la nav.
// Número mono + label "RDY" + barra de progreso en --m-rdy. La nav la firma este
// componente, no un logo. Presente en toda la app (vive en el rail del shell).
export function CompactReadiness({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div
      className="mb-[10px] flex flex-col items-center gap-[2px] border-b border-line px-0 pb-[14px] pt-[4px]"
      aria-label={`Readiness ${score} de 100`}
    >
      <span className="mono text-[22px] font-bold leading-none text-text">
        {score}
      </span>
      <span className="disp text-[8.5px] font-semibold tracking-[0.14em] text-text-faint">
        RDY
      </span>
      <span className="relative mt-[5px] h-[4px] w-[28px] rounded-full bg-ring-track">
        <i
          className="absolute inset-y-0 left-0 rounded-full bg-m-rdy"
          style={{ width: `${pct}%` }}
        />
      </span>
    </div>
  );
}
