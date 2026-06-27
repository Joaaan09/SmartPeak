import { useTheme } from './useTheme';

// Toggle de tema PROVISIONAL: existe solo para verificar ambos temas visualmente
// mientras montamos la base. El shell definitivo (rail / tab bar) lo reubicará.
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isPaper = theme === 'paper';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isPaper}
      aria-label={isPaper ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'}
      className="fixed bottom-5 right-5 z-50 grid h-11 w-11 place-items-center rounded-r-sm border border-line bg-surface text-text-muted shadow-token transition-colors duration-150 ease-out-ui hover:text-text"
    >
      {/* Icono de luna/sol mínimo; currentColor para heredar el monocromo. */}
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8z" />
      </svg>
    </button>
  );
}
