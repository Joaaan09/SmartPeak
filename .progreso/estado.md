# Estado — checkpoint de la última sesión

> Léeme al empezar. Actualízame al terminar cada sesión.

**Última actualización:** 2026-06-29

## Dónde estamos

**Sistema de diseño REALINEADO con la landing de marca (2026-06-29).** La app ya no usa el
"negro iOS + fuente del sistema"; ahora sigue la landing (`logos/SmartPeak Landing.html`):
**Space Grotesk** (UI) + **Space Mono** (datos/eyebrows), paleta **tinta/papel**, chrome
**monocromo sin gradientes**, **Readiness en barra lineal** (antes anillo) y **coach monocromo**
(retirado el gradiente IA). El color sigue viviendo solo en los datos (`--m-*`). Detalle y los
3 dilemas consultados (color datos / readiness / coach) en `decisiones.md` (2026-06-29).
Verificado visualmente con screenshot del `mockup-mono.html` reescrito (oscuro + claro).

**Scaffolding MERN montado y autenticación completa implementada y revisada.** Ya no es solo
doc + mock: hay app real.

- `server/` — Express + TypeScript (ESM) + Mongoose + JWT. Auth completa: modelo `User`
  (con `role`, `sex`, físicos y `preferences.theme`), rutas register/login/refresh/logout/me
  y `PATCH /users/me`. Validación con zod, bcrypt (cost 12), refresh en cookie httpOnly.
- `client/` — Vite + React 18 + TS + Tailwind v3. **Sistema de diseño bloqueado y alineado con la
  landing**: tokens CSS tinta/papel (oscuro default + `body.paper`), **Space Grotesk + Space Mono**,
  ThemeProvider. Favicons/marca (el "pico") en `client/public`.
  **UI de auth real**: login + **wizard de registro premium de 5 pasos** (Cuenta · Perfil ·
  Objetivo/rol · Físicos · Listo), AuthContext (token en memoria + rehidratación refresh→me),
  rutas protegidas. Primitivos UI reutilizables (Button, TextField, SegmentedControl, etc.).
- Raíz: `package.json` con `npm run dev` (concurrently server+client), `build`, `typecheck`.

**Estado de verificación:** `typecheck` + `build` + `lint` en verde (client) y `typecheck`
verde (server). Revisor: aprobado, sin críticos ni fugas de seguridad; hallazgos corregidos.
**✅ App funcionando end-to-end y CONFIRMADO POR EL USUARIO en navegador (2026-06-28):** se levantó
MongoDB local (mongodb-memory-server, `npm run db:dev`), backend (4000) y Vite (5173); el smoke
`POST /auth/register` devolvió **201** con `id` y sin `passwordHash`, y el login/registro renderiza
y funciona en el navegador. Durante esta validación se encontró y corrigió un bug de "Cargando"
infinito (StrictMode) en `AuthContext` — ver log/decisiones.

**Fase 1 (UI) — shell + Hoy en modo VISTA hecho y revisado (aprobado):**
- `client/src/layout/*` — `AppLayout` (regleta desktop + tab bar móvil con safe-area), header de
  pestaña (wordmark, sync, píldora de rol real, "Sincronizar"), tira meta. Rutas anidadas con
  `<Outlet/>`: `/` Hoy + placeholders `/tendencias` `/entreno` `/perfil` (logout en Perfil).
- `client/src/features/today/*` — dashboard bento (desktop) / stack 2-col (móvil): Readiness
  (count-up + **barra lineal** `--m-rdy`), Coach IA (**monocromo, sin gradiente**), 4 métricas con
  anillo `--m-*`, tendencia HRV 7d. Eyebrows en mono (`.eyebrow`). Widgets reutilizables +
  `data.ts` mock TIPADO (placeholder hasta el sync biométrico).
- Theme toggle movido a la regleta (desktop) + Perfil (móvil). `typecheck/build/lint` en verde.

## En curso

- **Realineado de diseño con la landing (2026-06-29): COMMITEADO** en `staging`
  (commit `refactor(ui): refina sistema de diseño, marca y pestaña Hoy`).
- **Despliegue dockerizado (2026-06-29):** añadidos `docker-compose.yml`, `server/Dockerfile`,
  `client/Dockerfile` + `client/nginx.conf`, `.dockerignore` (×2) y `.env.example`; `trust proxy`
  en `app.ts`. `build` completo (server+client) en verde. Patrón: 3 servicios (frontend/backend/
  mongo) tras el Nginx Proxy Manager del VPS, **mismo origen**, dominio `smartpeak.joan-coll.com`
  (DNS ya apunta al VPS). Ver `decisiones.md` (2026-06-29 · Despliegue). **Pendiente:** configurar
  el remoto git para el push y, en el VPS, crear `.env` + `docker compose up -d --build` + Proxy
  Host en NPM (lo hace el usuario).

## Siguiente paso (elegir)

1. **Iteración B de Hoy — modo edición** del dashboard: jiggle iOS, drag-reorder, resize por
   escalones, añadir/quitar desde catálogo, y **persistencia del layout** `{widgetId,x,y,w,h}`
   (vía `PATCH /users/me` o endpoint nuevo). DESIGN.md §5.
2. **Afinar el "tono" visual de Hoy** según lo que vea el usuario en el navegador (375px +
   desktop, ambos temas) antes de seguir. Login/registro ya confirmados; falta el OK de Hoy.
3. Fase 2: pestañas `Tendencias` / `Entreno` / `Perfil` reales.

> Smoke e2e con Mongo: HECHO y confirmado (registro 201). Para retomar la app en otra sesión:
> `npm run db:dev` (server) + `npm run dev` (raíz) → http://localhost:5173.

## Bloqueos / pendientes de decisión

- Modelo de IA por decidir · enfoques por rol · colores `--m-*` (provisionales).
- Mejora opcional pendiente (no bloqueante): single-flight del refresh ya hecho; falta suite de
  tests automatizados y rate-limiting en login (anotado para más adelante).

## Git / ramas (regla dura en CLAUDE.md §9)

- Desarrollo en `staging` (o ramas de feature → `staging`). `main` solo para validado.
- **`staging`** tiene auth + (shell + Hoy vista) mergeados. **`main` sigue en el baseline**
  (a la espera de validación e2e).
- **2026-06-29: realineado de diseño + dockerización commiteados en `staging`** (2 commits) y
  **mergeados a `main`** a petición del usuario. `logos/` ya trackeado. **Falta configurar el
  remoto** (no hay `origin`) para completar el push de ambas ramas.
- Próxima feature: nueva rama desde `staging` (p. ej. `feat/hoy-edit`).
