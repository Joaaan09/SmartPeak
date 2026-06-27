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

/**
 * Fecha de la tira meta en estilo del mockup: "MIÉ 25 JUN · 06:42".
 * En mayúsculas técnicas porque la tira meta es el único sitio que las usa
 * (DESIGN.md §2).
 */
export function metaDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '—';
  const day = new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(d);
  const date = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
  }).format(d);
  const time = new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
  // "mié" + "25 jun" → "MIÉ 25 JUN · 06:42" (sin el punto que el locale añade a veces).
  const clean = (s: string) => s.replace(/\./g, '').toUpperCase();
  return `${clean(day)} ${clean(date)} · ${time}`;
}
