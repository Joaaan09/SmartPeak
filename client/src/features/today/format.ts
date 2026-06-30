// Helpers de formato para la pestaña Hoy (cero dependencias, solo Intl).
// Todo el preprocesado de cadenas ocurre en JS (CLAUDE.md §4), nunca en la IA.

/** "hace 2 min", "hace 1 h", "ahora mismo"… a partir de un ISO. */
export function timeAgo(isoDate: string, now: Date = new Date()): string {
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return '—';
  const diffSec = Math.max(0, Math.round((now.getTime() - then) / 1000));

  if (diffSec < 45) return 'ahora mismo';
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `hace ${diffHour} h`;
  const diffDay = Math.round(diffHour / 24);
  return `hace ${diffDay} d`;
}

// Formateador de enteros con separador de miles en español ("13.494").
const integerFmt = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 });

/** Entero con separador de miles en español (13494 → "13.494"). */
export function formatInteger(n: number): string {
  return integerFmt.format(Math.round(n));
}

/** Horas decimales → "Hh MMm" (6.9 → "6h 54m"). */
export function formatHours(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

/** Acota un porcentaje al rango 0–100 para el relleno del anillo. */
export function clampPct(pct: number): number {
  return Math.max(0, Math.min(100, pct));
}
