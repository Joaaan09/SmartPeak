import { Outlet } from 'react-router-dom';
import { Rail } from './Rail';
import { TabBar } from './TabBar';

// Shell de las rutas autenticadas (DESIGN.md §6).
//
// - Desktop (lg+): regleta fija a la izquierda + zona de contenido scrollable.
// - Móvil: regleta oculta, tab bar inferior fija; el contenido scrollea con
//   padding inferior para no quedar bajo la tab bar (+ safe-area).
//
// Cada pestaña renderiza su propio AppHeader (título/meta correctos) dentro del
// <Outlet>, por eso aquí solo va la cáscara de navegación. Usa min-h-[100dvh]
// (no h-screen) por el chrome del navegador móvil (DESIGN.md §11).
//
// El Readiness compacto del rail va en estado "próximamente" (score=null) hasta
// que exista su cálculo real (DESIGN.md §11b).
export function AppLayout() {
  return (
    <div className="flex min-h-[100dvh] bg-bg lg:h-[100dvh] lg:overflow-hidden">
      <Rail readinessScore={null} />

      {/* Zona de contenido: en desktop scrollea internamente; en móvil scrollea
          la página y deja hueco para la tab bar (52px + safe-area). */}
      <main className="flex min-w-0 flex-1 flex-col pb-[calc(52px+env(safe-area-inset-bottom))] lg:overflow-y-auto lg:pb-0">
        <Outlet />
      </main>

      <TabBar />
    </div>
  );
}
