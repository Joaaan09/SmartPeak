import { Navigate, Link, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { useTodayMetrics } from '../useTodayMetrics';
import { formatHours, formatInteger } from '../format';
import { metricColorVar } from '../metricColors';
import type { DailyMetricsMetrics } from '../types';
import { HourlyBarChart } from './HourlyBarChart';
import { HeartRateChart } from './HeartRateChart';
import { SleepBreakdown } from './SleepBreakdown';

// Vista de detalle de una métrica (desglose intradía) — DESIGN.md §12.
//
// Shell de la vista (cabecera + estados) que despacha a las gráficas:
// - Push a pantalla completa DENTRO del shell (ruta /metrica/:metricKey anidada
//   bajo AppLayout): la regleta/tab bar permanecen. El atrás del navegador
//   cierra la vista (es una URL real).
// - Cabecera propia (no el AppHeader de pestaña): botón «‹ Hoy» + eyebrow
//   técnico <NOMBRE> · HOY + cifra-héroe del día en mono. El color vive SOLO en
//   el dato (--m-* de la métrica); el chrome es monocromo.
// - Estados: loading (skeleton que respeta la forma) · error (mensaje +
//   Reintentar) · vacío global (dailyMetrics null) · sin desglose (métrica
//   ausente en el DTO). Métrica no real en la URL → redirige a /.

// Las 4 métricas con desglose (las demás no navegan: ver MetricWidget).
type DetailMetricKey = 'sleep' | 'rhr' | 'steps' | 'energy';

const DETAIL_KEYS: readonly DetailMetricKey[] = ['sleep', 'rhr', 'steps', 'energy'];

function isDetailKey(key: string | undefined): key is DetailMetricKey {
  return key != null && (DETAIL_KEYS as readonly string[]).includes(key);
}

// Nombre técnico en mayúsculas para el eyebrow (<NOMBRE> · HOY).
const metricName: Record<DetailMetricKey, string> = {
  sleep: 'Sueño',
  rhr: 'FC reposo',
  steps: 'Pasos',
  energy: 'Energía activa',
};

/**
 * Cifra-héroe del día por métrica: valor formateado + unidad pequeña. Devuelve
 * `null` si la métrica concreta no está presente en el DTO (→ "sin desglose").
 */
function buildHero(
  key: DetailMetricKey,
  m: DailyMetricsMetrics,
): { value: string; unit?: string } | null {
  switch (key) {
    case 'sleep': {
      const total = m.sleep?.total;
      return total != null ? { value: formatHours(total) } : null;
    }
    case 'rhr': {
      const min = m.heartRate?.min;
      return min != null ? { value: formatInteger(min), unit: 'bpm' } : null;
    }
    case 'steps': {
      const qty = m.steps?.qty;
      return qty != null ? { value: formatInteger(qty) } : null;
    }
    case 'energy': {
      const kcal = m.activeEnergy?.kcal;
      return kcal != null ? { value: formatInteger(kcal), unit: 'kcal' } : null;
    }
  }
}

export function MetricDetailPage() {
  const { metricKey } = useParams();
  const { status, dailyMetrics, error, refetch } = useTodayMetrics();

  // Métrica no real en la URL (HRV/SpO₂/Peso/soon o param inválido) → /.
  if (!isDetailKey(metricKey)) {
    return <Navigate to="/" replace />;
  }

  const colorVar = metricColorVar[metricKey];
  const name = metricName[metricKey];

  return (
    <main className="px-[18px] pb-[22px] pt-[18px] sm:px-[24px]">
      {/* Cabecera propia: «‹ Hoy» + eyebrow técnico. Foco visible global. */}
      <header className="mb-[18px]">
        <BackToHoy />
        <p className="eyebrow mt-[14px] text-[10.5px]">{name} · HOY</p>

        {status === 'ready' && (
          <Hero
            metricKey={metricKey}
            name={name}
            colorVar={colorVar}
            metrics={dailyMetrics?.metrics ?? null}
          />
        )}
        {status === 'loading' && <HeroSkeleton name={name} />}
      </header>

      {/* Cuerpo del desglose según estado. */}
      {status === 'error' ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : status === 'loading' ? (
        <ChartSkeleton />
      ) : dailyMetrics === null ? (
        <EmptyState />
      ) : (
        <Breakdown metricKey={metricKey} metrics={dailyMetrics.metrics} />
      )}
    </main>
  );
}

// --- Cabecera ---------------------------------------------------------------

// Botón «‹ Hoy» como <Link> (un control que navega es <a>, §10). Target ≥44px,
// foco visible (outline global con --accent), hover sutil solo en puntero fino.
function BackToHoy() {
  return (
    <Link
      to="/"
      className={[
        'inline-flex min-h-[44px] items-center gap-[6px] rounded-full',
        'border border-line bg-surface px-[14px] font-body text-[13px] font-medium text-text',
        'transition-[transform,border-color,background-color] duration-150 ease-out-ui',
        'active:scale-[0.97]',
        '[@media(hover:hover)and(pointer:fine)]:hover:border-line-strong',
        '[@media(hover:hover)and(pointer:fine)]:hover:bg-surface-2',
      ].join(' ')}
    >
      <span aria-hidden="true" className="mono text-[15px] leading-none">
        ‹
      </span>
      Hoy
    </Link>
  );
}

// Cifra-héroe del día (color SOLO en el dato). Si la métrica falta en el DTO,
// no se pinta cifra: el cuerpo mostrará "sin desglose disponible".
function Hero({
  metricKey,
  name,
  colorVar,
  metrics,
}: {
  metricKey: DetailMetricKey;
  name: string;
  colorVar: string;
  metrics: DailyMetricsMetrics | null;
}) {
  const hero = metrics ? buildHero(metricKey, metrics) : null;

  return (
    <>
      <h1 className="sr-only">{name}</h1>
      {hero ? (
        <p className="mono mt-[6px] text-[40px] font-bold leading-[1.02] tracking-[-0.02em]" style={{ color: colorVar }}>
          {hero.value}
          {hero.unit && (
            <i className="ml-[5px] font-body text-[16px] font-medium not-italic text-text-muted">
              {hero.unit}
            </i>
          )}
        </p>
      ) : (
        <p className="mono mt-[6px] text-[40px] font-bold leading-[1.02] tracking-[-0.02em] text-text-faint">
          —
        </p>
      )}
    </>
  );
}

// --- Despacho al breakdown según la métrica ---------------------------------

function Breakdown({
  metricKey,
  metrics,
}: {
  metricKey: DetailMetricKey;
  metrics: DailyMetricsMetrics;
}) {
  // Métrica presente pero sin su dato del día → sin desglose (cabecera intacta).
  const hero = buildHero(metricKey, metrics);
  if (!hero) return <NoBreakdown />;

  switch (metricKey) {
    case 'steps':
      return (
        <HourlyBarChart
          hourly={metrics.steps?.hourly}
          colorVar="var(--m-steps)"
          unitTotal="pasos"
        />
      );
    case 'energy':
      return (
        <HourlyBarChart
          hourly={metrics.activeEnergy?.hourly}
          colorVar="var(--m-energy)"
          unitTotal="kcal"
        />
      );
    case 'rhr':
      return (
        <HeartRateChart samples={metrics.heartRate?.samples} colorVar="var(--m-rhr)" />
      );
    case 'sleep':
      return <SleepBreakdown sleep={metrics.sleep} />;
  }
}

// --- Estados ----------------------------------------------------------------

// Skeleton de la cifra-héroe (respeta la forma: eyebrow + bloque de cifra).
function HeroSkeleton({ name }: { name: string }) {
  return (
    <>
      <h1 className="sr-only">{name}</h1>
      <span className="sp-skel mt-[8px] block h-[42px] w-[148px]" aria-hidden="true" />
    </>
  );
}

// Skeleton del bloque de gráfica (nunca spinner; DESIGN.md §11/§12).
function ChartSkeleton() {
  return (
    <span
      className="sp-skel block h-[180px] w-full !rounded-r"
      aria-label="Cargando desglose"
    />
  );
}

// Sin desglose para una métrica real ausente en el DTO de hoy. La cabecera se
// conserva (la pinta MetricDetailPage); aquí solo el mensaje sobrio.
function NoBreakdown() {
  return (
    <div className="flex flex-col items-start gap-[10px] rounded-r border border-line bg-surface px-[18px] py-[16px]">
      <span className="eyebrow text-[10.5px]">Sin desglose</span>
      <p className="font-body text-[14px] leading-[1.5] text-text-muted">
        Sin desglose disponible para hoy.
      </p>
    </div>
  );
}

// Vacío global: aún no se ha sincronizado ningún dato (dailyMetrics: null).
function EmptyState() {
  return (
    <div className="flex flex-col items-start gap-[12px] rounded-r border border-line bg-surface px-[18px] py-[16px]">
      <span className="eyebrow text-[10.5px]">Sin datos</span>
      <p className="font-body text-[14px] leading-[1.5] text-text-muted">
        Aún no hay datos — pulsa <strong className="font-semibold text-text">Sincronizar</strong> en Hoy.
      </p>
      <Link
        to="/"
        className={[
          'inline-flex min-h-[44px] items-center rounded-full',
          'border border-line bg-surface px-[14px] font-body text-[13px] font-medium text-text',
          'transition-[transform,border-color,background-color] duration-150 ease-out-ui',
          'active:scale-[0.97]',
          '[@media(hover:hover)and(pointer:fine)]:hover:border-line-strong',
          '[@media(hover:hover)and(pointer:fine)]:hover:bg-surface-2',
        ].join(' ')}
      >
        Ir a Hoy
      </Link>
    </div>
  );
}

// Error de carga: mismo patrón que TodayPage (mensaje sobrio + Reintentar).
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
