// Fila de estadísticas resumen del desglose (equivalente textual SIEMPRE en el
// DOM, no solo el SVG — DESIGN.md §12). Cada stat = label técnico (eyebrow mono)
// + cifra en mono `tabular-nums`. El color vive solo en el dato si se pasa
// `colorVar`; por defecto el chrome es monocromo.
//
// Pinta una fila densa de stats (p. ej. PICO · MEDIA · TOTAL) bajo la gráfica,
// alineada a la rejilla de la vista de detalle.

export interface DetailStat {
  /** Label técnico en mayúsculas (eyebrow mono). */
  label: string;
  /** Valor ya formateado (mono tabular-nums). */
  value: string;
  /** Unidad pequeña opcional pegada al valor. */
  unit?: string;
}

export interface DetailStatsProps {
  stats: DetailStat[];
  /** Color del dato (token --m-*); si se omite, los valores van en --text. */
  colorVar?: string;
}

export function DetailStats({ stats, colorVar }: DetailStatsProps) {
  if (stats.length === 0) return null;

  return (
    <dl className="flex flex-wrap gap-x-[28px] gap-y-[12px]">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-[4px]">
          <dt className="eyebrow text-[10px]">{stat.label}</dt>
          <dd
            className="mono text-[19px] font-bold leading-[1.05] tracking-[-0.01em] text-text"
            style={colorVar ? { color: colorVar } : undefined}
          >
            {stat.value}
            {stat.unit && (
              <i className="ml-[3px] font-body text-[12px] font-medium not-italic text-text-muted">
                {stat.unit}
              </i>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
