import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { ROLE_LABELS } from '../auth/types';
import { Button } from '../components/ui/Button';
import { Wordmark } from '../components/Wordmark';

// Home mínima REAL para verificar el flujo end-to-end de auth.
// NO es el dashboard de widgets (eso es otra fase): solo saluda al usuario,
// muestra su rol legible y permite cerrar sesión.
export function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    // Tras limpiar la sesión, ProtectedRoute redirige; navegamos explícito igual.
    navigate('/login', { replace: true });
  }

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm text-center">
        <Wordmark className="mb-6 justify-center" />

        <p className="disp text-xs font-semibold uppercase tracking-widest text-text-faint">
          Sesión iniciada
        </p>
        <h1 className="mt-2 disp text-2xl font-semibold tracking-[-0.01em] text-text">
          Hola, {user?.name ?? 'atleta'}
        </h1>

        {user ? (
          <p className="mt-2 font-body text-sm text-text-muted">
            Objetivo:{' '}
            <span className="font-medium text-text">
              {ROLE_LABELS[user.role]}
            </span>
          </p>
        ) : null}

        <p className="mt-4 font-body text-sm text-text-muted">
          El dashboard de widgets llega en la siguiente fase.
        </p>

        <div className="mt-8 flex justify-center">
          <Button
            type="button"
            variant="ghost"
            onClick={handleLogout}
            loading={loggingOut}
          >
            Cerrar sesión
          </Button>
        </div>
      </div>
    </main>
  );
}
