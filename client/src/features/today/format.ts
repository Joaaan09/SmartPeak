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
