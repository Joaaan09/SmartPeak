import { useAuth } from '../../auth/useAuth';
import { ROLE_LABELS } from '../../auth/types';
import { AppHeader } from '../../layout/AppHeader';
import { ReadinessWidget } from './widgets/ReadinessWidget';
import { CoachWidget } from './widgets/CoachWidget';
import { MetricWidget } from './widgets/MetricWidget';
import { TrendWidget } from './widgets/TrendWidget';
import { todayData } from './data';
import { timeAgo } from './format';

// Pestaña Hoy (DESIGN.md §5/§7) — dashboard de widgets en MODO VISTA.
//
// Desktop (lg+): rejilla bento de 12 columnas con grid-auto-flow:dense
//   (Readiness 5×2 dominante · Coach 4×2 · 4 métricas span 3 · Tendencia span 8).
// Móvil: reflow a scroll vertical — Readiness y Coach a ancho completo, métricas
//   en 2 columnas, Tendencia a ancho completo. Sin overflow oculto: scrollea.
//
// El stagger de entrada (50ms) se asigna por orden de aparición (índice).
// El modo edición (jiggle/drag/resize/añadir/persistencia) es OTRA iteración:
// los widgets ya son componentes aislados con un chrome común (Widget) listo
// para envolverlos con manijas sin tocar su contenido.
//
// Los DATOS son placeholder (todayData) salvo el ROL, que sale del user real.
export function TodayPage() {
  const { user } = useAuth();
  const { readiness, metrics, coach, trend, sync } = todayData;

  const roleLabel = user ? ROLE_LABELS[user.role] : undefined;
  const syncStatus = `${sync.source} · Sincronizado · ${timeAgo(sync.lastSyncedAt)}`;

  return (
    <>
      <AppHeader
        tab="Hoy"
        syncStatus={syncStatus}
        roleLabel={roleLabel}
        showSync
      />

      <div className="px-[18px] pb-[22px] pt-[18px] sm:px-[24px]">
        <div className="grid auto-rows-min grid-cols-2 gap-[14px] lg:auto-rows-[minmax(112px,1fr)] lg:grid-cols-12 lg:[grid-auto-flow:dense]">
          <ReadinessWidget data={readiness} index={0} />
          <CoachWidget data={coach} roleLabel={roleLabel ?? 'Coach'} index={1} />
          {metrics.map((metric, i) => (
            <MetricWidget key={metric.key} data={metric} index={2 + i} />
          ))}
          <TrendWidget data={trend} index={2 + metrics.length} />
        </div>
      </div>
    </>
  );
}
