# Estado — checkpoint de la última sesión

> Léeme al empezar. Actualízame al terminar cada sesión.

**Última actualización:** 2026-06-30

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

- **Sincronización biométrica — pasos 1 (recepción/inspección) y 2 (PERSISTENCIA) HECHOS, revisados
  (aprobados) y DESPLEGADOS en producción.** `POST /api/sync/health` (token por usuario, header
  `x-sync-token`) valida con Zod, normaliza el payload de HAE v2 y hace **upsert de un documento
  diario** (`DailyMetrics`, 1 por `(userId, date)`, índice único, merge que no pisa campos manuales).
  **Flujo probado end-to-end desde el iPhone** (Atajo *Export Health Metrics* → POST, plan Basic).
  Inventario real del anillo: solo `sleep_analysis`, `heart_rate`, `step_count`, `active_energy`
  (sin HRV/SpO2/peso → irán por **entrada manual**). Revisor con tests reales (mongodb-memory-server):
  17/17 OK. Detalle en `decisiones.md`/`log.md` (2026-06-30). Token de prueba:
  `npm --prefix server run sync:token -- <email>`. Disparo: **automático (HAE programado) + deep link**.
- **Realineado de diseño con la landing (2026-06-29): COMMITEADO** en `staging`
  (commit `refactor(ui): refina sistema de diseño, marca y pestaña Hoy`).
- **✅ DESPLEGADO Y FUNCIONANDO en producción (2026-06-29):** `https://smartpeak.joan-coll.com`
  sirve la SPA y `/api/health` responde 200 tras NPM + TLS (Let's Encrypt). Stack dockerizado:
  3 servicios (frontend nginx / backend node / mongo) tras el Nginx Proxy Manager del VPS, **mismo
  origen**. Corridos en `~/servers/smartpeak` (clonado de `github.com/Joaaan09/SmartPeak`, rama
  `main`), `.env` con secretos en el VPS (chmod 600). Durante el despliegue se arreglaron 2 bugs
  (orden de arranque Mongo → healthcheck; colisión del nombre `backend` en la red del proxy →
  `smartpeak-backend`). Detalle en `log.md` y `decisiones.md` (2026-06-29 · Despliegue).
- **Pendiente menor:** el usuario debe pushear el commit `fix(deploy)` (commits ya a su nombre,
  Joaaan09); luego `git reset --hard origin/main` en el VPS para sincronizar (ahora tiene el fix
  aplicado a mano). Operación de redespliegue: `git pull && docker compose up -d --build`.

## Siguiente paso (elegir)

0. **Sobre el sync biométrico (recepción + persistencia): HECHO y desplegado.** Próximos sobre esta
   base: (a) **cálculo del Readiness** en el backend (sueño + desviación FC reposo + carga; medias en
   JS, cache diaria §4); (b) **entrada manual** de HRV/SpO2/peso (endpoint autenticado + UI en Perfil,
   `source:"manual"` en el mismo `DailyMetrics`); (c) **vista Hoy/Tendencias contra datos reales**
   (sustituir el mock `data.ts`); (d) botón "Sincronizar" deep link + endpoint generar/rotar token;
   (e) tests permanentes (mongodb-memory-server ya instalado). Subir `client_max_body_size` solo si
   el payload supera ~1MB (hoy ~800 bytes/día, sobra margen).
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
