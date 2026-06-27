// Indicador de progreso sobrio del wizard (DESIGN.md §3: monocromo).
// "Paso N / Total" con el numeral en mono + segmentos finos. El segmento activo
// y los completados se rellenan con --accent (monocromo); el resto, --line.

type StepProgressProps = {
  current: number; // 1-based
  total: number;
};

export function StepProgress({ current, total }: StepProgressProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-body text-xs font-medium text-text-muted">
        Paso <span className="mono text-text">{current}</span>
        <span className="mx-0.5 text-text-faint"> / </span>
        <span className="mono">{total}</span>
      </p>
      <div
        className="flex gap-1.5"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Paso ${current} de ${total}`}
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={[
              'h-1 flex-1 rounded-full transition-colors duration-200 ease-out',
              i < current ? 'bg-accent' : 'bg-line',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  );
}
