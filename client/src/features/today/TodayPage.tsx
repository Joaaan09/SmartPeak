import { useAuth } from '../../auth/useAuth';
import { ROLE_LABELS } from '../../auth/types';
import { AppHeader } from '../../layout/AppHeader';
import { Button } from '../../components/ui/Button';
import { ReadinessWidget } from './widgets/ReadinessWidget';
import { CoachWidget } from './widgets/CoachWidget';
import { MetricWidget, MetricWidgetSkeleton } from './widgets/MetricWidget';
import { TrendWidget } from './widgets/TrendWidget';
import { useTodayMetrics } from './useTodayMetrics';
import { buildManualCards, buildMetricCards } from './buildTodayView';
import { timeAgo } from './format';

// Pestaña Hoy (DESIGN.md §5/§7) — dashboard de widgets en MODO VISTA, ahora
// alimentado por datos biométricos REALES (GET /api/metrics/latest).
//
// Desktop (lg+): rejilla bento de 12 columnas con grid-auto-flow:dense
//   (Readiness 5×2 dominante · Coach 4×2 · 4 métricas span 3 · Tendencia span 8).
// Móvil: reflow a scroll vertical.
//
// Estados (DESIGN.md §11b):
// - loading → skeletons que respetan la forma del widget.
// - error   → mensaje sobrio + Reintentar (monocromo).
// - ready + null → vacío global (CTA a Sincronizar) + cards manuales en
//   próximamente; Readiness/Coach/Trend en próximamente.
// - ready + datos → 4 cards reales (con-dato o sin-dato), Readiness/Coach/Trend
//   en próximamente, fila manual en próximamente.
//
// Readiness · Coach · Tendencia SIEMPRE van en "próximamente": su cálculo/análisis
// aún no existe. Las cards manuales (HRV · SpO2 · Peso) también.

export function TodayPage() {
  const { user } = useAuth();
  const { status, dailyMetrics, error, refetch } = useTodayMetrics();

  const roleLabel = user ? ROLE_LABELS[user.role] : undefined;

  const synced = dailyMetrics !== null;
  const syncStatus = synced
    ? `Sincronizado · ${timeAgo(dailyMetrics.updatedAt)}`
    : 'Sin sincronizar';

  const metricCards = buildMetricCards(dailyMetrics);
  const manualCards = buildManualCards();

  return (
    <>
      <AppHeader
        tab="Hoy"
        syncStatus={status === 'ready' ? syncStatus : undefined}
        synced={synced}
        roleLabel={roleLabel}
        showSync
      />

      <div className="px-[18px] pb-[22px] pt-[18px] sm:px-[24px]">
        {status === 'error' ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <>
            {/* Vacío global: aún no se ha sincronizado nada. */}
            {status === 'ready' && !synced && <EmptyState />}

            {/* Rejilla principal (bento). */}
            <div className="grid auto-rows-min grid-cols-2 gap-[14px] lg:auto-rows-[minmax(112px,1fr)] lg:grid-cols-12 lg:[grid-auto-flow:dense]">
              <ReadinessWidget comingSoon index={0} />
              <CoachWidget comingSoon roleLabel={roleLabel ?? 'Coach'} index={1} />

              {status === 'loading'
                ? metricCards.map((card, i) => (
                    <MetricWidgetSkeleton key={card.key} index={2 + i} />
                  ))
                : metricCards.map((card, i) => (
                    <MetricWidget key={card.key} data={card} index={2 + i} />
                  ))}

              <TrendWidget comingSoon index={2 + metricCards.length} />
            </div>

            {/* Fila secundaria: métricas manuales (HRV · SpO2 · Peso) en
                próximamente. 3 × span 4 = 12 columnas → fila limpia. */}
            <div className="mt-[14px] grid auto-rows-min grid-cols-2 gap-[14px] lg:auto-rows-[minmax(112px,1fr)] lg:grid-cols-12">
              {manualCards.map((card, i) => (
                <MetricWidget
                  key={card.key}
                  data={card}
                  span="4"
                  index={3 + metricCards.length + i}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

// --- Sub-componentes de estado ---------------------------------------------

function EmptyState() {
  return (
    <div className="mb-[14px] flex flex-col items-start gap-[10px] rounded-r border border-line bg-surface px-[18px] py-[16px]">
      <span className="eyebrow text-[10.5px]">Sin datos</span>
      <p className="font-body text-[14px] leading-[1.5] text-text-muted">
        Aún no hay datos biométricos. Pulsa{' '}
        <strong className="font-semibold text-text">Sincronizar</strong> para
        traer tus métricas desde el Atajo de iOS.
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-[12px] rounded-r border border-line bg-surface px-[18px] py-[16px]">
      <span className="eyebrow text-[10.5px]">Error</span>
      <p className="font-body text-[14px] leading-[1.5] text-text-muted">
        {message ?? 'No se pudieron cargar tus datos.'}
      </p>
      <Button variant="ghost" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}
