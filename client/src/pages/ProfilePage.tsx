import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { ROLE_LABELS } from '../auth/types';
import { useTheme } from '../theme/useTheme';
import { Button } from '../components/ui/Button';
import { MoonIcon } from '../components/icons';
import { InstallApp } from '../features/pwa/InstallApp';
import { PlaceholderPage } from '../features/placeholder/PlaceholderPage';

// Pestaña Perfil (rol, tema, sincronización). En esta iteración es mínima:
// muestra el nombre y el rol legible del user, ofrece el TOGGLE DE TEMA accesible
// en móvil (en desktop también vive en el rail) y permite CERRAR SESIÓN (logout
// movido aquí desde la antigua HomePage). El resto (editar perfil, ajustes de
// sync) llega en su fase.
export function ProfilePage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const isPaper = theme === 'paper';

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    // Tras limpiar la sesión, ProtectedRoute redirige; navegamos explícito igual.
    navigate('/login', { replace: true });
  }

  return (
    <PlaceholderPage tab="Perfil">
      <div className="w-full max-w-md">
        <p className="disp text-[11px] font-semibold uppercase tracking-[0.14em] text-text-faint">
          Sesión iniciada
        </p>
        <h2 className="mt-[6px] disp text-[24px] font-semibold tracking-[-0.01em] text-text">
          {user?.name ?? 'Atleta'}
        </h2>
        {user && (
          <p className="mt-[6px] font-body text-[14px] text-text-muted">
            Objetivo:{' '}
            <span className="font-medium text-text">{ROLE_LABELS[user.role]}</span>
          </p>
        )}

        {/* Toggle de tema accesible (clave en móvil: el rail no existe ahí). */}
        <section className="mt-[28px] border-t border-line pt-[20px]">
          <h3 className="disp text-[12px] font-semibold uppercase tracking-[0.08em] text-text-muted">
            Apariencia
          </h3>
          <div className="mt-[12px] flex items-center justify-between gap-4">
            <span className="font-body text-[14px] text-text">
              Tema {isPaper ? 'claro' : 'oscuro'}
            </span>
            <Button
              variant="ghost"
              onClick={toggleTheme}
              aria-pressed={isPaper}
              aria-label={
                isPaper ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'
              }
            >
              <MoonIcon width={16} height={16} />
              {isPaper ? 'Oscuro' : 'Claro'}
            </Button>
          </div>
        </section>

        {/* Instalación PWA (Añadir a pantalla de inicio). Se auto-oculta si la
            app ya está instalada o el navegador no lo soporta. */}
        <InstallApp />

        <section className="mt-[28px] border-t border-line pt-[20px]">
          <Button
            variant="ghost"
            onClick={handleLogout}
            loading={loggingOut}
          >
            Cerrar sesión
          </Button>
        </section>
      </div>
    </PlaceholderPage>
  );
}
