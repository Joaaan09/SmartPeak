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

- **PESO CORPORAL por SYNC — HECHO, revisado (APTO para staging), SIN COMMITEAR (2026-06-30).** El
  usuario reportó que el peso no llegaba pese a estar en Apple Health. **Diagnóstico:** el Atajo
  **sí** exporta `weight_body_mass` (confirmado con payload real: kg, `source:"Salud"`, ~1 lectura
  los días que se pesa) pero el normalizador lo **tiraba en el `default`** del switch (solo soportaba
  4 métricas). **Clasificación previa errónea corregida:** el peso NO es como HRV/SpO2 (que el anillo
  no vuelca a Salud) — el peso **sí** está en Apple Health, es sincronizable. **Hecho:** `case
  'weight_body_mass'` en `syncBiometrics.ts` (escalar/día, kg sin conversión, «última lectura del día
  gana») + persistencia **fuera** del `$set` masivo con **doble `updateOne`** y precedencia
  **«manual gana»** (el sync no pisa `metrics.weight.source:'manual'`). Modelo: comentario de
  `weight` actualizado (ya no es solo-manual). **43/43 tests** (ejecutor 41 + 2 de cobertura) +
  revisor con **11 adversariales** → **APTO**; typecheck limpio. **Decidido** (en `decisiones.md`,
  2026-06-30): el peso **coexiste por 2 vías** (sync + entrada manual futura). **Falta (otra tanda):**
  vía manual (endpoint + UI) y mostrar el peso en `Hoy` (hoy «Próximamente»). Limitación menor
  conocida: desempate por TZ lexicográfico (irrelevante en uso real). **Solo backend, sin commitear.**
- **FIX TabBar móvil que "flotaba" a media altura al scrollear en la PWA standalone de iOS
  (2026-06-30).** Causa: bug de WebKit `position: fixed` + `backdrop-filter` con **scroll del
  body**. Arreglo en `AppLayout`: patrón **app-shell** (shell = `h-[100dvh]` + `overflow-hidden`;
  scroll movido a `<main>` con `overflow-y-auto` + `overscroll-behavior-y:contain`) también en
  móvil, no solo desktop. **TabBar sin tocar** → se conserva el blur. typecheck · lint · build en
  verde. Ver `decisiones.md`/`log.md`. **Falta:** que el usuario lo confirme en su iPhone.
- **SCORES BIOMÉTRICOS DETERMINISTAS — HECHOS, revisados (3 pasos APROBADOS) y ✅ VALIDADOS
  VISUALMENTE POR EL USUARIO (2026-06-30).** Motor de cálculo **puro** en
  `server/src/services/scores/` (5 scores: **Calidad de sueño · Preparación/Readiness ·
  Esfuerzo/Strain · Nivel de energía · Estrés-proxy**) con **baseline personal** (z-scores
  muestrales), **renormalización de pesos por disponibilidad** y **cold-start**
  (`confidence: low/medium/high`). Funciones puras + **28 tests** (suite server 37/37). El
  directorio `server/src/services/scores/` está **sin commitear (untracked)**.
  **Integrados al vuelo** en `GET /api/metrics/latest` → responde `{ dailyMetrics, scores }`
  **sin persistir** (la caché en Mongo se reserva para la IA, regla §4); `.sort({ date: -1 })`
  obligatorio (contrato del motor). **UI de Hoy cableada:** Readiness **real** (anillo por estado
  + badge de confianza en cold-start), card de **Sueño** con anillo = **calidad %** (horas a
  sub-dato), cards nuevas de **Nivel de energía** y **Esfuerzo** (color de métrica + estado en el
  caption), **Estrés** en «Próximamente (requiere HRV)». 2 tokens nuevos (`--m-energylvl` cian,
  `--m-strain` violeta) → **DESIGN.md §14**. Revisor APROBADO en 3 pasos (motor / integración /
  UI, sin críticos); typecheck · lint · build en verde. **Decidido** (ya en `decisiones.md`):
  estrés **vía HRV manual** (derivado de la HRV, no del valor del anillo) e ingesta de lo NO
  exportado por **captura + IA** con 3 vías (teclado / foto / Atajo de iOS) → ver el nuevo
  [`dispositivo.md`](dispositivo.md). **Siguiente:** bloque de entrada manual de HRV (3 vías) →
  activa el estrés derivado y completa el componente HRV del Readiness.
- **PWA INSTALABLE («Añadir a pantalla de inicio») — HECHA, revisada (APROBADA) y ✅ VALIDADA EN
  IPHONE (Safari) POR EL USUARIO (2026-06-30) — el caso de uso principal.** La web es ahora una PWA instalable en Android e iOS,
  con affordance en la pestaña **Perfil**. Enfoque **MANUAL** (sin `vite-plugin-pwa`): manifest
  propio (`client/public/manifest.webmanifest`, `standalone`, bg/theme `#0E0F12`, iconos `any` +
  `maskable`), metas en `client/index.html` (`link rel="manifest"`, `mobile-web-app-capable`,
  `apple-mobile-web-app-*` con `status-bar-style=black`), **SW mínimo** `client/public/sw.js`
  (network-first en navegación · cache-first en `/assets` · **ignora `/api`** y terceros;
  `skipWaiting`+`clients.claim`, registrado **solo en producción** desde `main.tsx`) y reglas en
  `client/nginx.conf` (`/sw.js` no-store, `/manifest.webmanifest` no-cache + content-type). UI en
  `client/src/features/pwa/` (`installStore.ts` + `useInstallPrompt.ts` con `useSyncExternalStore`
  + `InstallApp.tsx`); sección **«Instalación»** monocroma en `ProfilePage.tsx` que **bifurca por
  plataforma** (Android/Chrome → prompt nativo; iOS Safari → guía Compartir→Añadir en `<details>`).
  Iconos maskable generados a mano (script Node/zlib, sin ImageMagick/sharp). **NO offline-first**
  (la app depende del backend) → **cumple la regla 4 de CLAUDE.md** (no añade llamadas a IA).
  **Revisor APROBADO** tras corregir la captura tardía de `beforeinstallprompt` (se movió al store
  global). DESIGN.md **§13** documenta el patrón. **Verificación:** typecheck · lint · build en
  verde. **Falta (no prioritario):** probar instalación real en **Android (Chrome)** + Lighthouse
  «Installable» (iOS ya validado). Detalle en `log.md`/`decisiones.md`.
- **Desglose intradía: cards de «Hoy» clickables → vista de detalle por métrica — HECHO, revisado
  (APTO), PENDIENTE DE VALIDACIÓN VISUAL (2026-06-30).** Primer consumo del intradía ya ingerido.
  **Sin backend** (`GET /api/metrics/latest` ya devolvía las series). Front: solo las cards en
  estado `data` (Sueño·FC·Pasos·Energía) navegan a `/metrica/:metricKey` (ruta anidada bajo
  `AppLayout` → shell persiste; URL real con atrás del navegador). `MetricDetailPage` con cabecera
  «‹ Hoy» + cifra-héroe + estados (loading/error/vacío/sin-desglose) y redirección si la métrica no
  es real. Gráficas SVG hechas a mano: **barras 0–23 con pico resaltado** (pasos/energía), **banda
  mín–máx + media** (FC), **fases apiladas por opacidad de `--m-sleep`** (sueño, sin serie horaria,
  decisión del usuario). Tokens nuevos: ninguno (reusa `--m-*`). DESIGN.md **§12** documenta el
  patrón. `Widget` ahora admite `to?` (`<Link>`). Revisor APTO, sin críticos; menores corregidos.
  **+ Tooltip interactivo (2026-06-30):** las 3 gráficas muestran el valor de cada hora/fase bajo
  demanda — **hover en desktop, tap en móvil** (hook `useHourScrubber` + `ChartTooltip`; teclado
  ←→·Esc; cierre por tap-fuera; snap al sample real en FC; segmentos de sueño como `<button>`).
  Responsividad a 375px cuidada (tooltip clampado, sin overflow). DESIGN.md **§12b**.
  **+ Scrub táctil + sin selección de texto (2026-06-30):** en móvil se puede **arrastrar el dedo**
  por la gráfica (el punto/segmento activo sigue al dedo) y **ya no se selecciona el texto / no sale
  la lupa de iOS** (clase `.sp-chart-scrub`: `user-select:none` + `-webkit-touch-callout:none` +
  `touch-action:pan-y`). La mecánica vive en el hook genérico compartido **`usePointerScrub(pickIndex,
  count)`** (`useHourScrubber` = wrapper de 24; sueño = contenedor único enfocable con hit-area ~44px).
  **Sin captura de puntero** (se quitó `setPointerCapture`, que secuestraba el scroll vertical): el
  navegador arbitra vía `pan-y` (vertical=scroll · horizontal=scrub). Revisores: 1ª APTO c/reservas
  (desfase X de FC y hover por `matchMedia` corregidos), 2ª (tras el fix de captura) **APTO**.
  **✅ VALIDADO EN MÓVIL POR EL USUARIO (2026-06-30):** el arrastre (scrub), el scroll vertical y la
  no-selección funcionan. **Falta (no bloqueante):** repaso visual en desktop + ambos temas con más
  histórico; el resto del histórico/Tendencias sigue pendiente. **Sin commitear aún.** Detalle en
  `log.md`/`decisiones.md`.
- **Ingesta HORARIA (intradía) de FC, pasos y energía — HECHA, revisada (APROBADA), PENDIENTE DE
  DESPLEGAR (2026-06-30).** El normalizador (`syncBiometrics.ts`) deja de colapsar a 1 punto/día:
  cuando HAE exporta con *Time Grouping = Hour* guarda **series por hora** (`heartRate.samples`,
  `steps.hourly`, `activeEnergy.hourly`, `t="HH:00"` local) **además** del agregado diario derivado
  (pasos=suma · energía=suma kcal · FC=min/max/avg). Sueño sigue 1/día. Upsert idempotente (`$set`
  del objeto completo, no `$push`) y **retrocompatible** con el formato diario legacy. Total diario =
  suma de tramos redondeados (cuadra con la serie). 9/9 tests + 7 de borde del revisor; **APTO para
  desplegar**. **Falta:** (a) desplegar (merge `staging`→`main` + `docker compose up --build`);
  (b) **reenviar el JSON horario de la semana** al endpoint para poblar el histórico (pendiente el
  archivo completo del usuario). Detalle en `log.md`/`decisiones.md` (2026-06-30).
- **Pestaña «Hoy» CONECTADA A BIOMETRÍA REAL + botón «Sincronizar» funcional (2026-06-30),
  revisada (APROBADA).** Nuevo `GET /api/metrics/latest` (autenticado) que devuelve el
  `DailyMetrics` más reciente (200 con `{dailyMetrics:null}` si no hay datos, no 404). El front
  elimina el mock `data.ts` y consume el endpoint con el hook `useTodayMetrics` (loading/error/
  ready + re-fetch on `visibilitychange`/`focus`). **4 cards reales** (Sueño·FC reposo·Pasos·
  Energía) desde el sync; **HRV/SpO2/Peso** (manuales) y **Coach/Tendencia** en estado
  **«Próximamente»** (alcance acordado: «solo datos reales», el resto va a la tarea de su cálculo
  + IA). **El Readiness y el resto de scores ya NO están «Próximamente»: son reales** (ver el
  bloque de scores deterministas arriba). Estado vacío global con CTA a Sincronizar; skeletons. El
  botón «Sincronizar» dispara el deep link del Atajo de iOS
  (`shortcuts://run-shortcut?name=SmartPeak`). Diseño: token `--m-energy` (coral, provisional) +
  DESIGN.md §3b/§11b. Metas/ringPct provisionales (en código).
  **Falta validación visual en navegador** (375px + desktop, ambos temas).
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

0. **Bloque de entrada manual de HRV (3 vías) + estrés derivado — SIGUIENTE PRIORIDAD.** Activa el
   **estrés-proxy** (hoy «Próximamente») y **completa el componente HRV del Readiness**. 3 vías de
   ingesta: **teclado · foto (captura + IA) · Atajo de iOS** — el detalle de qué se captura y por
   qué está en [`dispositivo.md`](dispositivo.md). El estrés se **deriva de la HRV manual** (no se
   teclea el del anillo). Endpoint autenticado + `source:"manual"` en el mismo `DailyMetrics`.
   **Ubicación de la UI (decidida 2026-06-30):** teclado en el **detalle de cada métrica**; foto =
   flujo central «Importar captura» desde **Hoy** (no en Perfil, no pestaña propia) — ver
   `dispositivo.md` (Ubicación en la UI) y `decisiones.md`.
   **Plan faseado (acordado 2026-06-30; implementación APLAZADA por el usuario a «mañana»):**
   **T1 — HRV por teclado, de punta a punta** (la siguiente): endpoint manual genérico `PATCH
   /api/metrics/manual` `{date?, hrv?, spo2?, weight?}` (JWT, `source:'manual'`, **merge por campo**
   como el sync, sin pisar lo del Atajo) + tests; **verificar/cablear** que el motor de `scores/`
   consume `metrics.hrv` (activa el componente HRV del Readiness + el estrés derivado); front: la
   card HRV deja de ser `soon` → clickable a `/metrica/hrv`, y `MetricDetailPage` gana el caso HRV
   (cifra/vacío con CTA + form de teclado). **T2** — hoja «Añadir datos de hoy» en Hoy (teclado
   multi-campo) + SpO₂. **T3** — flujo «Importar desde captura» (IA visión) + revisión por confianza
   (requiere decidir el modelo de IA con visión). **T4** — Atajo de iOS (`/api/ingest/capturas`,
   `x-sync-token`). **Default**: la HRV que se teclea = «variabilidad media durante el sueño»
   (rMSSD, ms), no una diurna puntual. **Nota peso**: ya llega por **sync** (no urge la vía manual
   de peso; el endpoint la admite igual, con precedencia «manual gana»). Implementar con el
   **harness** (explorador → ejecutor backend → ejecutor front → revisor).
1. **Sync biométrico + scores deterministas: HECHO y validado** (recepción + persistencia + lectura
   en Hoy + **cálculo de Readiness/scores en el backend**, medias en JS). Lo que **queda** sobre
   esta base: (a) **entrada manual** de SpO2/peso (además de la HRV del punto 0) → sus cards dejan
   de ser «Próximamente»; (b) **Tendencias contra datos reales** (Hoy ya consume datos reales vía
   `GET /api/metrics/latest`; falta la pestaña Tendencias e histórico multi-día para deltas/
   sparklines); (c) endpoint **generar/rotar token** de sync (el deep link del botón ya funciona);
   (d) tests permanentes (mongodb-memory-server ya instalado); (e) **Coach IA** real (regla §4).
   Subir `client_max_body_size` solo si el payload supera ~1MB (hoy ~800 bytes/día, sobra margen).
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
- **⚠️ El working tree mezcla 3 trabajos sin commitear** (todos sobre `staging`): **scores
  biométricos** (incluye `server/src/services/scores/` **untracked**), **vista de detalle intradía**
  y **PWA**. Al commitear hay que **separarlos por feature o incluirlos a conciencia** (no hacer un
  `git add -A` ciego que mezcle las tres tandas en un solo commit).
- Próxima feature: nueva rama desde `staging` (p. ej. `feat/hoy-edit`).
