// Helpers de ids estables para enlazar controles con sus nodos de error/ayuda
// (aria-describedby). Viven fuera del componente para no romper Fast Refresh.

/** id del nodo de error de un control. */
export function errorId(controlId: string): string {
  return `${controlId}-error`;
}

/** id del nodo de ayuda de un control. */
export function hintId(controlId: string): string {
  return `${controlId}-hint`;
}
