// Wordmark "SmartPeak" discreto para las pantallas de auth (como en el mock:
// fuente del sistema, peso 700, tracking ligeramente negativo).
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <p
      className={`disp text-lg font-bold tracking-[-0.02em] text-text ${className}`}
    >
      SmartPeak
    </p>
  );
}
