# Estado — checkpoint de la última sesión

> Léeme al empezar. Actualízame al terminar cada sesión.

**Última actualización:** 2026-06-27

## Dónde estamos

**Scaffolding MERN montado y autenticación completa implementada y revisada.** Ya no es solo
doc + mock: hay app real.

- `server/` — Express + TypeScript (ESM) + Mongoose + JWT. Auth completa: modelo `User`
  (con `role`, `sex`, físicos y `preferences.theme`), rutas register/login/refresh/logout/me
  y `PATCH /users/me`. Validación con zod, bcrypt (cost 12), refresh en cookie httpOnly.
- `client/` — Vite + React 18 + TS + Tailwind v3. **Sistema de diseño bloqueado**: tokens CSS
  exactos del mockup (oscuro default + `body.paper`), fuente Space Mono, ThemeProvider.
  **UI de auth real**: login + **wizard de registro premium de 5 pasos** (Cuenta · Perfil ·
  Objetivo/rol · Físicos · Listo), AuthContext (token en memoria + rehidratación refresh→me),
  rutas protegidas. Primitivos UI reutilizables (Button, TextField, SegmentedControl, etc.).
- Raíz: `package.json` con `npm run dev` (concurrently server+client), `build`, `typecheck`.

**Estado de verificación:** `typecheck` + `build` + `lint` en verde (client) y `typecheck`
verde (server). Revisor: aprobado, sin críticos ni fugas de seguridad; hallazgos corregidos.
**No probado end-to-end contra Mongo** (no hay MongoDB en este equipo) — pendiente smoke real.

**Fase 1 (UI) — shell + Hoy en modo VISTA hecho y revisado (aprobado):**
- `client/src/layout/*` — `AppLayout` (regleta desktop + tab bar móvil con safe-area), header de
  pestaña (wordmark, sync, píldora de rol real, "Sincronizar"), tira meta. Rutas anidadas con
  `<Outlet/>`: `/` Hoy + placeholders `/tendencias` `/entreno` `/perfil` (logout en Perfil).
- `client/src/features/today/*` — dashboard bento (desktop) / stack 2-col (móvil): Readiness
  (count-up + anillo), Coach IA (gradiente exclusivo), 4 métricas con anillo `--m-*`, tendencia
  HRV 7d. Widgets reutilizables + `data.ts` mock TIPADO (placeholder hasta el sync biométrico).
- Theme toggle movido a la regleta (desktop) + Perfil (móvil). `typecheck/build/lint` en verde.

## En curso

- Nada a medias. Auth y (shell + Hoy vista) cerrados y mergeados a `staging`.

## Siguiente paso (elegir)

1. **Iteración B de Hoy — modo edición** del dashboard: jiggle iOS, drag-reorder, resize por
   escalones, añadir/quitar desde catálogo, y **persistencia del layout** `{widgetId,x,y,w,h}`
   (vía `PATCH /users/me` o endpoint nuevo). DESIGN.md §5.
2. **Validar el render real** de Hoy en navegador a 375px y desktop, ambos temas (el revisor no
   pudo: solo auditó código). Ajustar el "tono" si hace falta antes de seguir.
3. **Smoke e2e con MongoDB** (Atlas/local): registro 5 pasos → sesión → logout → login;
   confirmar `toJSON` sin `passwordHash` con doc real.
4. Fase 2: pestañas `Tendencias` / `Entreno` / `Perfil` reales.

## Bloqueos / pendientes de decisión

- Modelo de IA por decidir · enfoques por rol · colores `--m-*` (provisionales).
- Mejora opcional pendiente (no bloqueante): single-flight del refresh ya hecho; falta suite de
  tests automatizados y rate-limiting en login (anotado para más adelante).

## Git / ramas (regla dura en CLAUDE.md §9)

- Desarrollo en `staging` (o ramas de feature → `staging`). `main` solo para validado.
- **`staging` = `c10ad53`** con auth + (shell + Hoy vista) ya mergeados (vía `feat/scaffold-auth`
  y `feat/hoy-shell`). **`main` sigue en el baseline `b9851a5`** (a la espera de validación e2e).
- Próxima feature: nueva rama desde `staging` (p. ej. `feat/hoy-edit`).
