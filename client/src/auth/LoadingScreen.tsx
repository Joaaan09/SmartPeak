// Estado de carga sobrio mientras se rehidrata la sesión.
// Spinner discreto con tokens (monocromo), sin texto que grite. No bloquea el
// look Apple-grade: es un punto que respira en el centro.
export function LoadingScreen() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-bg">
      <span className="sr-only" role="status">
        Cargando tu sesión
      </span>
      <span
        aria-hidden="true"
        className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-text"
      />
    </main>
  );
}
