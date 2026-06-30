import { Outlet } from 'react-router-dom';
import { Rail } from './Rail';
import { TabBar } from './TabBar';

// Shell de las rutas autenticadas (DESIGN.md §6).
//
// - Desktop (lg+): regleta fija a la izquierda + zona de contenido scrollable.
// - Móvil: regleta oculta, tab bar inferior fija; el contenido scrollea DENTRO
//   del <main> (no el documento) y deja hueco para la tab bar (52px + safe-area).
//
// PATRÓN APP-SHELL (scroll interno también en móvil): el shell ocupa exactamente
// el viewport (h-[100dvh] + overflow-hidden) y el scroll vive en <main>, NO en el
// documento/body. Esto arregla un bug de iOS Safari/PWA standalone por el que una
// barra `position: fixed` con `backdrop-filter` (la TabBar) se desancla y "flota"
// a media altura durante el scroll con inercia del body: con el body estático,
// WebKit recompone bien el fixed y el blur se mantiene. (DESIGN.md §11 · decisiones).
//
// Cada pestaña renderiza su propio AppHeader (título/meta correctos) dentro del
// <Outlet>, por eso aquí solo va la cáscara de navegación.
//
// El Readiness compacto del rail va en estado "próximamente" (score=null) hasta
// que exista su cálculo real (DESIGN.md §11b).
export function AppLayout() {
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-bg">
      <Rail readinessScore={null} />

      {/* Zona de contenido scrollable (el documento NO scrollea). overscroll
          contain mata el rubber-band que revelaría el fondo en iOS. El padding
          inferior deja hueco bajo la tab bar fija en móvil (52px + safe-area). */}
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto [overscroll-behavior-y:contain] pb-[calc(52px+env(safe-area-inset-bottom))] lg:pb-0">
        <Outlet />
      </main>

      <TabBar />
    </div>
  );
}
