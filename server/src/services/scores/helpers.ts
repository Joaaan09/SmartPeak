// Utilidades numéricas compartidas por el motor de scores. Funciones puras,
// sin estado ni I/O. La regla del proyecto manda preprocesar toda la aritmética
// en JS (nunca en la IA): este es uno de los ladrillos de esa estrategia.

/** Acota `x` al intervalo [min, max]. */
export function clamp(x: number, min: number, max: number): number {
  if (x < min) return min;
  if (x > max) return max;
  return x;
}

/**
 * Interpolación lineal de `x` desde el dominio [x0, x1] al rango [y0, y1],
 * con clamp del resultado a [min(y0,y1), max(y0,y1)]. Si el dominio es
 * degenerado (x0 === x1) devuelve y0 (evita dividir por cero).
 */
export function linMap(x: number, x0: number, x1: number, y0: number, y1: number): number {
  if (x0 === x1) return y0;
  const t = (x - x0) / (x1 - x0);
  const y = y0 + t * (y1 - y0);
  const lo = Math.min(y0, y1);
  const hi = Math.max(y0, y1);
  return clamp(y, lo, hi);
}

/** Redondea `x` a `decimals` (0 o 1) cifras decimales. */
export function round(x: number, decimals: 0 | 1 = 0): number {
  const f = decimals === 1 ? 10 : 1;
  return Math.round(x * f) / f;
}

/** Media aritmética de una lista no vacía; `undefined` si está vacía. */
export function mean(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  let sum = 0;
  for (const v of values) sum += v;
  return sum / values.length;
}
