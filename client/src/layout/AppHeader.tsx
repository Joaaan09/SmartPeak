import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { PeakMark } from '../components/PeakMark';

// Header de cada pestaña (DESIGN.md §6). Estructura del mockup canónico:
// wordmark "SmartPeak · <Tab>" (fuente sistema) + estado de sync (punto --pos +
// "Sincronizado · hace X") arriba; a la derecha la píldora de ROL del user, el
// botón "Editar" (DESHABILITADO — el modo edición es otra iteración) y el botón
// primario "Sincronizar" (.btn).
//
// Responsive mobile-first: en móvil el wordmark+sync van arriba y los controles
// bajan a una segunda fila; el botón "Editar" se oculta en móvil (es secundario
// y aún no funcional) para no saturar a 375px.
//
// El botón "Sincronizar" dispara el Atajo de iOS "SmartPeak" vía deep link
// (estrategia "Pull", CLAUDE.md §2). No necesita callback: el hook de la pantalla
// Hoy re-fetchea on-visibilitychange cuando el usuario vuelve del Atajo.

// Nombre exacto del Atajo de iOS (CLAUDE.md §2). encodeURIComponent lo deja sin
// espacios y a prueba de futuros renombres.
const SHORTCUT_NAME = 'SmartPeak';
const SHORTCUT_URL = `shortcuts://run-shortcut?name=${encodeURIComponent(
  SHORTCUT_NAME,
)}`;

interface AppHeaderProps {
  /** Título de la pestaña (Hoy / Tendencias / …). */
  tab: string;
  /** Texto del estado de sync ("Sincronizado · hace 2 min"). Opcional. */
  syncStatus?: string;
  /** Si false, el punto del estado de sync va atenuado (sin sincronizar). */
  synced?: boolean;
  /** Rol legible del user (Powerlifting / Hipertrofia / Salud general). Opcional. */
  roleLabel?: string;
  /** Muestra el botón primario "Sincronizar". */
  showSync?: boolean;
}

export function AppHeader({
  tab,
  syncStatus,
  synced = true,
  roleLabel,
  showSync = false,
}: AppHeaderProps) {
  // Micro-estado visual breve al lanzar el Atajo (no bloquea la navegación).
  const [opening, setOpening] = useState(false);

  const handleSync = () => {
    setOpening(true);
    // Dispara el Atajo de iOS. Al volver, el hook de Hoy re-fetchea solo.
    window.location.href = SHORTCUT_URL;
    // Reset del micro-estado por si el deep link no cambia de app (p. ej. en
    // escritorio): no dejamos el botón en "Abriendo…" para siempre.
    window.setTimeout(() => setOpening(false), 1500);
  };

  return (
    <header className="border-b border-line">
      <div className="flex flex-col gap-3 px-[18px] pt-[16px] sm:px-[30px] lg:flex-row lg:items-end lg:justify-between lg:gap-5 lg:pb-[14px] lg:pt-[18px]">
        <div>
          <div className="flex items-center gap-[10px]">
            <PeakMark size={20} className="text-text" />
            <h1 className="disp text-[21px] font-bold tracking-[-0.02em] text-text">
              SmartPeak
            </h1>
            <span className="text-text-faint">·</span>
            <span className="disp text-[13px] font-semibold tracking-[0.01em] text-text-muted">
              {tab}
            </span>
          </div>
          {syncStatus && (
            <p className="mt-[7px] flex items-center gap-2 font-body text-[12.5px] text-text-muted">
              <span
                className={[
                  'h-[7px] w-[7px] rounded-full',
                  synced ? 'bg-pos' : 'bg-text-faint',
                ].join(' ')}
                aria-hidden="true"
              />
              {syncStatus}
            </p>
          )}
        </div>

        {(roleLabel || showSync) && (
          <div className="flex items-center gap-[10px] pb-[14px] lg:pb-0">
            {roleLabel && (
              <span className="inline-flex min-h-[44px] items-center rounded-full border border-line bg-surface px-[14px] font-body text-[13px] font-medium text-text">
                {roleLabel}
              </span>
            )}
            {/* Modo edición: otra iteración → botón presente pero deshabilitado. */}
            <Button
              variant="ghost"
              disabled
              title="Próximamente"
              className="hidden lg:inline-flex"
            >
              Editar
            </Button>
            {showSync && (
              <Button variant="primary" onClick={handleSync}>
                {opening ? 'Abriendo Atajo…' : 'Sincronizar'}
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
