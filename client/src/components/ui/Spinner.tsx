// Spinner inline monocromo (currentColor) para estados de carga de botones.
// Hereda el color del texto del botón, así funciona en primary y ghost.
export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}
