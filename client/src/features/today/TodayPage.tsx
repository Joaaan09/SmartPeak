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
import type { ReadinessConfidence, ReadinessData, ReadinessResult } from './types';

// Confianza del cálculo de Readiness → subtítulo del widget (DESIGN.md §14):
// en cold-start (pocos días de histórico) NO se finge precisión; se avisa en el
// `sub`. El widget pinta ese slot tal cual (no hace falta rediseñarlo).
const CONFIDENCE_SUB: Record<ReadinessConfidence, string> = {
  low: 'Confianza baja · pocos días de histórico',
  medium: 'Confianza media',
  high: 'Listo para entrenar',
};

/** Mapea el resultado del motor de Readiness al modelo de vista del widget. */
function toReadinessData(result: ReadinessResult): ReadinessData {
  return {
    score: result.score,
    state: result.state,
    sub: CONFIDENCE_SUB[result.confidence],
  };
}

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
// - ready + datos → cards reales (interpretadas + crudas), Readiness con su
//   score real (o próximamente si el motor no lo pudo calcular).
//
// Readiness se cablea a su score real (DESIGN.md §14); cae a "próximamente" si
// `scores.readiness == null` (sin datos clave). Coach y Tendencia SIGUEN en
// "próximamente" (su análisis aún no existe), igual que las manuales (HRV·SpO2·Peso).

export function TodayPage() {
  const { user } = useAuth();
  const { status, dailyMetrics, scores, error, refetch } = useTodayMetrics();

  const roleLabel = user ? ROLE_LABELS[user.role] : undefined;

  const synced = dailyMetrics !== null;
  const syncStatus = synced
    ? `Sincronizado · ${timeAgo(dailyMetrics.updatedAt)}`
    : 'Sin sincronizar';

  const metricCards = buildMetricCards(dailyMetrics, scores);
  const manualCards = buildManualCards();

  // Readiness real si el motor lo pudo calcular; si no, "próximamente".
  const readiness = scores?.readiness;
  const readinessData = readiness ? toReadinessData(readiness) : undefined;

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
              {/* Readiness real cuando hay score; si no, "próximamente"
                  (DESIGN.md §14). Mientras carga, también "próximamente". */}
              <ReadinessWidget
                data={readinessData}
                comingSoon={status === 'loading' || !readinessData}
                index={0}
              />
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
