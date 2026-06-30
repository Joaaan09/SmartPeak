import { NavLink } from 'react-router-dom';
import { NAV_TABS } from './nav';

// Tab bar inferior (DESIGN.md §6) — solo móvil. Estilo nativo iOS: 4 items
// (icono custom + label largo apilados, mismos iconos que el rail), activa
// marcada por color/peso, aria-current. Fija al borde inferior, respeta
// env(safe-area-inset-bottom). Cada item es un <NavLink> (navegación) con touch
// target ≥44px. El toggle de tema en móvil vive en la pestaña Perfil (no en la
// tab bar, que es solo navegación). Los iconos son aria-hidden; el label nombra.
export function TabBar() {
  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-[color-mix(in_srgb,var(--surface)_85%,var(--bg))] pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      {NAV_TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            [
              'flex min-h-[52px] flex-1 flex-col items-center justify-center gap-[3px] pt-[8px] pb-[6px]',
              'disp text-[11px] tracking-[0.02em]',
              'transition-[transform,color] duration-150 ease-out-ui active:scale-[0.97]',
              isActive ? 'font-semibold text-text' : 'font-medium text-text-faint',
            ].join(' ')
          }
        >
          <tab.Icon width={22} height={22} />
          <span>{tab.long}</span>
        </NavLink>
      ))}
    </nav>
  );
}
