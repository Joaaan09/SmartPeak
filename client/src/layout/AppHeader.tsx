import { Button } from '../components/ui/Button';

// Header de cada pestaña (DESIGN.md §6). Estructura del mockup canónico:
// wordmark "SmartPeak · <Tab>" (fuente sistema) + estado de sync (punto --pos +
// "Sincronizado · hace X") arriba; a la derecha la píldora de ROL del user, el
// botón "Editar" (DESHABILITADO — el modo edición es otra iteración) y el botón
// primario "Sincronizar" (.btn). Debajo, la tira meta fina (fecha · fuente).
//
// Responsive mobile-first: en móvil el wordmark+sync van arriba y los controles
// bajan a una segunda fila; el botón "Editar" se oculta en móvil (es secundario
// y aún no funcional) para no saturar a 375px.

interface AppHeaderProps {
  /** Título de la pestaña (Hoy / Tendencias / …). */
  tab: string;
  /** Texto del estado de sync ("Sincronizado · hace 2 min"). Opcional. */
  syncStatus?: string;
  /** Rol legible del user (Powerlifting / Hipertrofia / Salud general). Opcional. */
  roleLabel?: string;
  /** Muestra el botón primario "Sincronizar". */
  showSync?: boolean;
  /** Texto de la tira meta (fecha). Si se omite, no se renderiza la tira. */
  metaDate?: string;
  /** Fuente de los datos para la tira meta (p. ej. "Apple Health"). */
  metaSource?: string;
}

export function AppHeader({
  tab,
  syncStatus,
  roleLabel,
  showSync = false,
  metaDate,
  metaSource,
}: AppHeaderProps) {
  return (
    <header className="border-b border-line">
      <div className="flex flex-col gap-3 px-[18px] pt-[16px] sm:px-[30px] lg:flex-row lg:items-end lg:justify-between lg:gap-5 lg:pb-[14px] lg:pt-[18px]">
        <div>
          <div className="flex items-baseline gap-[11px]">
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
              <span className="h-[7px] w-[7px] rounded-full bg-pos" aria-hidden="true" />
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
            {showSync && <Button variant="primary">Sincronizar</Button>}
          </div>
        )}
      </div>

      {metaDate && (
        <div className="flex flex-wrap items-center gap-x-[22px] gap-y-2 border-t border-line px-[18px] py-[9px] disp text-[11px] tracking-[0.01em] text-text-faint sm:px-[30px]">
          <span>{metaDate}</span>
          {metaSource && (
            <span>
              FUENTE{' '}
              <b className="font-semibold text-text-muted">
                {metaSource.toUpperCase()}
              </b>
            </span>
          )}
        </div>
      )}
    </header>
  );
}
