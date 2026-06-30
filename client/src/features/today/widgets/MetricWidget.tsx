import { Widget, type WidgetSpan } from './Widget';
import { metricColorVar } from '../metricColors';
import type { DeltaDirection, MetricCard } from '../types';

// Widget de métrica REUTILIZABLE con tres estados de dato (DESIGN.md §11b),
// conservando siempre su chrome y su tamaño (no se oculta ni colapsa):
//
// - `data`  → cifra en mono + mini-anillo en el color --m-* de la métrica. El
//   delta es OPCIONAL: solo si hay histórico (en esta tarea no lo hay), así que
//   sin delta no se renderiza la zona (nada de "0%").
// - `empty` → métrica real pero ausente hoy: cifra "—" en --text-faint, anillo en
//   --ring-track (sin color), caption "sin dato". El label sigue legible.
// - `soon`  → feature/métrica aún no implementada: badge mono PRÓXIMAMENTE, sin
//   color ni cifra, atenuado pero con borde+label legibles, no interactivo.
//
// También un modo `loading` (skeleton que respeta la forma; nunca spinner).

// El mapa métrica → token de color (--m-*) vive en ../metricColors (compartido
// con la vista de detalle). Cada color SOLO en su métrica (DESIGN.md §3).

// Dirección del delta → color de señal + glifo (solo cuando hay histórico).
const deltaMeta: Record<DeltaDirection, { colorVar: string; glyph: string }> = {
  up: { colorVar: 'var(--pos)', glyph: '↑' },
  down: { colorVar: 'var(--neg)', glyph: '↓' },
  flat: { colorVar: 'var(--text-muted)', glyph: '' },
};

// --- Skeleton ---------------------------------------------------------------

export function MetricWidgetSkeleton({
  index = 0,
  span = '3',
}: {
  index?: number;
  span?: WidgetSpan;
}) {
  return (
    <Widget span={span} index={index} ariaLabel="Cargando métrica">
      <div className="flex items-center justify-between gap-2">
        <span className="sp-skel h-[11px] w-[52px]" />
      </div>
      <div className="mt-[14px] flex items-center gap-[15px] lg:mt-auto">
        <span className="sp-skel h-[58px] w-[58px] !rounded-full" aria-hidden="true" />
        <span className="flex min-w-0 flex-1 flex-col gap-[8px]">
          <span className="sp-skel h-[24px] w-[64px]" />
          <span className="sp-skel h-[11px] w-[80px]" />
        </span>
      </div>
    </Widget>
  );
}

// --- Widget -----------------------------------------------------------------

export function MetricWidget({
  data,
  index = 0,
  span = '3',
}: {
  data: MetricCard;
  index?: number;
  span?: WidgetSpan;
}) {
  // Próximamente: atenuado, sin color de métrica, no interactivo.
  if (data.state === 'soon') {
    return (
      <Widget
        span={span}
        index={index}
        ariaLabel={`${data.label}: próximamente`}
        // aria-disabled comunica "no operable" sin que el widget sea un control.
        ariaDisabled
        className="opacity-60"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="eyebrow text-[10.5px]">{data.label}</span>
          <span
            className="mono text-[9px] font-bold tracking-[0.08em] text-text-faint"
            aria-hidden="true"
          >
            PRÓXIMAMENTE
          </span>
        </div>
        <div className="mt-[14px] flex items-center gap-[15px] lg:mt-auto">
          <span
            className="h-[58px] w-[58px] flex-shrink-0 rounded-full border-[3px] border-ring-track"
            aria-hidden="true"
          />
          <span className="flex min-w-0 flex-col">
            <span className="mono text-[27px] font-bold leading-[1.05] tracking-[-0.02em] text-text-faint">
              —
            </span>
            {/* Motivo concreto si lo hay (p. ej. "Requiere HRV"); si no, copy genérico. */}
            <span className="disp mt-[4px] text-[11.5px] text-text-faint">
              {data.reason ?? 'próximamente'}
            </span>
          </span>
        </div>
      </Widget>
    );
  }

  // Sin dato hoy: cifra "—", anillo en track (sin color), caption "sin dato".
  if (data.state === 'empty') {
    return (
      <Widget
        span={span}
        index={index}
        ariaLabel={`${data.label}: sin dato`}
        style={{ ['--ring' as string]: 'var(--ring-track)', ['--p' as string]: 0 }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="eyebrow text-[10.5px]">{data.label}</span>
        </div>
        <div className="mt-[14px] flex items-center gap-[15px] lg:mt-auto">
          <span className="sp-minring" aria-hidden="true" />
          <span className="flex min-w-0 flex-col">
            <span className="mono text-[27px] font-bold leading-[1.05] tracking-[-0.02em] text-text-faint">
              —
            </span>
            <span className="disp mt-[4px] text-[11.5px] text-text-faint">
              {data.caption}
            </span>
          </span>
        </div>
      </Widget>
    );
  }

  // Con dato.
  const delta = data.delta ? deltaMeta[data.delta.direction] : null;
  const ringColor = metricColorVar[data.key];
  // Navegación OPCIONAL (DESIGN.md §12/§14): solo las cards con desglose intradía
  // (sueño + crudas) navegan. Los scores derivados sin desglose (nivel de
  // energía, esfuerzo) marcan `navigable:false` → no son <Link>, solo dato.
  const navigable = data.navigable !== false;

  return (
    <Widget
      span={span}
      index={index}
      // La card con dato y desglose navega a su intradía (DESIGN.md §12); el
      // aria-label lo anuncia. Las no navegables (y empty/soon) no llevan `to`.
      to={navigable ? `/metrica/${data.key}` : undefined}
      ariaLabel={`${data.label}: ${data.value}${data.unit ? ' ' + data.unit : ''}${
        navigable ? ' — ver desglose' : ''
      }`}
      // --ring + --p alimentan el conic-gradient del mini-anillo (ver clase sp-minring).
      style={{
        ['--ring' as string]: ringColor,
        ['--p' as string]: data.ringPct,
      }}
    >
      <div className="flex min-h-[16px] items-center justify-between gap-2">
        <span className="eyebrow text-[10.5px]">{data.label}</span>
        {delta && data.delta && (
          <span
            className="mono inline-flex items-center gap-[3px] text-[12px] font-bold"
            style={{ color: delta.colorVar }}
          >
            {delta.glyph && <span aria-hidden="true">{delta.glyph}</span>}
            {data.delta.label}
          </span>
        )}
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
