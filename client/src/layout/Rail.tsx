import { NavLink } from 'react-router-dom';
import { useTheme } from '../theme/useTheme';
import { MoonIcon } from '../components/icons';
import { CompactReadiness } from './CompactReadiness';
import { NAV_TABS } from './nav';
import type { ReadinessState } from '../features/today/types';

// Regleta de navegación (DESIGN.md §6) — solo desktop (≈104px). Estructura:
// 1) Readiness compacto (ancla de identidad), 2) nav (icono custom + label largo
// apilados, tile relleno sutil --surface-2 en la activa), 3) foot con el toggle
// de tema. Son enlaces de navegación → <nav> + <NavLink> (no botones), con
// aria-current. Iconos en index.tsx (estilo MoonIcon, monocromos, sin Lucide).
export function Rail({
  readinessScore,
  readinessState,
}: {
  /** Score 0–100; null mientras no haya cálculo de Readiness. */
  readinessScore: number | null;
  readinessState?: ReadinessState;
}) {
  const { theme, toggleTheme } = useTheme();
  const isPaper = theme === 'paper';

  return (
    <aside
      className="relative z-[2] hidden w-[104px] flex-shrink-0 flex-col items-stretch border-r border-line bg-[color-mix(in_srgb,var(--surface)_60%,var(--bg))] px-0 pb-[12px] pt-[14px] lg:flex"
    >
      <div className="px-3">
        <CompactReadiness score={readinessScore} state={readinessState} />
      </div>

      <nav className="flex flex-1 flex-col gap-[3px] px-2.5" aria-label="Secciones">
        {NAV_TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              [
                'group flex flex-col items-center gap-[5px] rounded-[12px] px-2 py-[11px]',
                'transition-[transform,color,background-color] duration-150 ease-out-ui',
                'active:scale-[0.97]',
                isActive
                  ? 'bg-surface-2 text-text'
                  : 'text-text-faint [@media(hover:hover)and(pointer:fine)]:hover:text-text-muted',
              ].join(' ')
            }
          >
            <tab.Icon width={20} height={20} />
            <span className="text-[11px] font-semibold tracking-[0.04em]">
              {tab.long}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col items-center gap-2 border-t border-line pt-[10px]">
        <button
          type="button"
          onClick={toggleTheme}
          aria-pressed={isPaper}
          aria-label={isPaper ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'}
          className="grid h-11 w-11 place-items-center rounded-r-sm text-text-faint transition-[transform,color,background-color] duration-150 ease-out-ui active:scale-[0.97] [@media(hover:hover)and(pointer:fine)]:hover:bg-surface-2 [@media(hover:hover)and(pointer:fine)]:hover:text-text"
        >
          <MoonIcon width={18} height={18} />
        </button>
      </div>
    </aside>
  );
}
