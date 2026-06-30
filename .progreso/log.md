# Log — historial de todo

> Entradas cronológicas (más reciente arriba). Anota qué se hizo en cada sesión.

---

2026-06-30 — Fix: la TabBar móvil "flotaba" a media altura al hacer scroll en la PWA standalone de iOS. Causa: bug de WebKit con `position: fixed` + `backdrop-filter` cuando el scroll lo hace el documento/body. Arreglo (AppLayout): patrón app-shell — el shell ocupa el viewport (`h-[100dvh]` + `overflow-hidden`) y el scroll pasa al `<main>` (`overflow-y-auto` + `overscroll-behavior-y:contain`) también en móvil (antes solo en desktop). Con el body estático, iOS recompone bien la barra fija y se conserva el blur. Sin tocar TabBar. Verificado por la ausencia de scroll-to-top/sticky (nada que romper). typecheck · lint · build en verde. Falta validación en el iPhone del usuario.

---

2026-06-30 — Scores biométricos deterministas: motor puro (sueño/readiness/esfuerzo/energía/estrés) + baseline + 28 tests; integrados al vuelo en GET /metrics/latest; UI de Hoy cableada (Readiness real, sueño=calidad%, energía/esfuerzo, estrés "próximamente"); DESIGN.md §14 + 2 tokens. Revisado (motor/integración/UI) y validado por el usuario. Decidido: estrés vía HRV manual; ingesta por captura+IA (3 vías) → nuevo dispositivo.md.

---

## 2026-06-30 — Skills de diseño traídas al REPO (`.claude/skills/`) + `impeccable` descartada

- **Disparador:** el usuario pregunta por qué las skills de diseño "instaladas" no están en
  `.claude/skills/`. **Causa raíz:** la decisión 2026-06-27 las instaló en `~/.claude/skills/`
  (home global del Mac), no en el repo; al clonar al VPS no viajaron (allí ese dir no existe).
- **Hecho:** copiadas `design-taste-frontend` y `emil-design-eng` desde la copia local de
  `total-grind/.agents/skills/` a `smartpeak/.claude/skills/` (son `SKILL.md` puros). Ya aparecen
  como skills disponibles en la sesión.
- **`impeccable` descartada** (coincidencia usuario+orquestador): es un sistema con instalador
  propio (50 scripts en `.agents/`, 23 comandos) que solapa con DESIGN.md, ya autoritativo. Se
  deja fuera; sus ideas ya integradas en DESIGN.md no se revierten.
- **Bloqueado por el harness:** el auto-mode classifier veta descargar repos hallados por el
  agente y auto-otorgarse el permiso. `review-animations` (de `emilkowalski/skills`) queda
  **pendiente** de que el usuario la descargue o añada `Bash(npx skills add:*)` a la config.
- **Doc:** CLAUDE.md §5 actualizado (lista 3 skills, ruta `.claude/skills/`); decisión y orígenes
  de repos en `decisiones.md` (2026-06-30).

---

## 2026-06-30 — PWA instalable («Añadir a pantalla de inicio») + affordance en Perfil

- PWA instalable: manifest + metas iOS + SW mínimo + affordance «Instalar app» en Perfil (Android:
  prompt nativo / iOS: guía Compartir→Añadir). Iconos maskable generados a mano. El revisor detectó
  captura tardía de `beforeinstallprompt` (se montaba en el componente de Perfil, tarde); corregido
  con store global importado en `main.tsx`. Build/lint/typecheck en verde. Enfoque MANUAL (sin
  `vite-plugin-pwa`), SW NO offline-first (ignora `/api`; cumple regla 4). DESIGN.md §13.
  **✅ Validado en iPhone (Safari) por el usuario (2026-06-30)** — el caso de uso principal.
  **Falta (no prioritario):** prueba real en Android (Chrome) + Lighthouse «Installable».

---

## 2026-06-30 — Scrub táctil de las gráficas (arrastrar el dedo) + sin selección de texto

- **Disparador:** en móvil el tooltip funcionaba pero (a) al mantener pulsado se **seleccionaba el
  texto / salía la lupa de iOS** (feo), y (b) **no se podía arrastrar el dedo** por la gráfica (había
  que ir tocando punto por punto), sobre todo en FC.
- **Front (ejecutor):** clase `.sp-chart-scrub` (`touch-action: pan-y` + `user-select:none` +
  `-webkit-user-select:none` + `-webkit-touch-callout:none`) en las 3 gráficas → no hay selección
  ni callout; el dato (cifra-héroe + `DetailStats`) queda FUERA, sigue seleccionable. **Drag-to-
  scrub**: arrastrar el dedo mueve el punto/segmento activo y su tooltip; al levantar se mantiene
  visible; tap-fuera cierra. El sueño pasó a un contenedor único enfocable con hit-area ~44px.
- **1ª revisión: APTO CON RESERVAS** → hallazgo 🟠 real: `setPointerCapture` en el `pointerdown`
  **secuestraba el scroll vertical** cuando el gesto empezaba sobre la gráfica.
- **Fix (ejecutor):** se **quitó toda la captura de puntero**; se confía en `touch-action: pan-y`
  (el navegador arbitra: vertical=scroll de página → `pointercancel` oculta el tooltip; horizontal=
  scrub). Mecánica extraída a un hook genérico compartido **`usePointerScrub(pickIndex, count)`**
  (`useHourScrubber` queda como wrapper de 24; el sueño lo usa con sus fases) → elimina la
  duplicación y el riesgo de `lostpointercapture`. **2ª revisión: APTO** (typecheck·lint·build
  verdes; cero `setPointerCapture` en código; modelo sin captura, teclado por `count` y `pickPhase`
  validados; orden de hooks correcto). 2 hallazgos 🟢 cosméticos (uno —redacción de un comentario
  CSS— corregido). DESIGN.md §12b actualizada.
- **✅ Validado en móvil por el usuario (2026-06-30):** el arrastre (scrub), el scroll vertical y la
  no-selección de texto funcionan. Pendiente solo repaso visual en desktop + ambos temas.

---

## 2026-06-30 — Tooltip interactivo en las gráficas del desglose (hover desktop · tap móvil)

- **Disparador:** el usuario pidió un "hover" en las gráficas que en móvil aparezca al pulsar, y
  asegurar la responsividad a 375px.
- **Front (ejecutor):** `ChartTooltip` (burbuja reutilizable, `--surface-2`+borde+sombra, clampada
  dentro de la gráfica) + hook `useHourScrubber` (hora activa unificada: hover ratón / tap táctil
  con toggle / teclado ←→·Esc / cierre por tap-fuera). Integrado en barras (pasos/energía) y FC
  (con snap al sample real más cercano + guía vertical + punto sobre el avg). En sueño, los
  segmentos de fase pasan a `<button>` (foco/teclado/tap nativos) con su tooltip. Keyframe
  `tooltip-in` (fade+scale<200ms, off en `prefers-reduced-motion`). Responsividad: `touch-pan-y`
  (no atrapa el scroll vertical), barra de sueño a 16px, sin overflow horizontal. DESIGN.md §12b.
- **Revisor: APTO CON RESERVAS** → 2 hallazgos corregidos en el momento: (1) **desfase horizontal**
  del tooltip de FC (anclaba en `(h+0.5)/24` mientras el punto/guía usan `h/23`; unificado a
  `toX(hour)`); (2) **hover por `pointerType`** en JS en vez de la media query que exige §11/§12b →
  añadido guard `matchMedia('(hover: hover) and (pointer: fine)')` (regla dura), conservando el
  filtro `pointerType`. Verificado: el punto de FC NO se descuadra en vertical (riesgo descartado),
  el listener global de tap-fuera no fuga, teclado sin doble-toggle, clamp del tooltip garantizado a
  375px. typecheck · lint · build en verde tras los arreglos.
- **Falta:** validación visual/táctil en navegador real (gesto tap/tap-fuera, `touch-pan-y`).

---

## 2026-06-30 — Desglose intradía: cards de «Hoy» clickables → vista de detalle por métrica

- **Disparador:** el usuario quiere empezar a MOSTRAR los datos por horas (ya ingeridos): que los
  iconos/cards del dashboard sean clickables y dentro se vea el desglose. Consultadas 2 decisiones
  de producto (ver `decisiones.md`): **Sueño → desglose por fases** (no por horas) y **apertura →
  vista a pantalla completa** con URL propia (no bottom-sheet).
- **Backend:** sin cambios. `GET /api/metrics/latest` ya devuelve el documento completo → las
  series horarias (`heartRate.samples`/`steps.hourly`/`activeEnergy.hourly`) ya viajaban al front;
  solo faltaba tiparlas y consumirlas.
- **Front (ejecutor, 2 piezas):**
  - *Fundaciones + interactividad:* tipadas las series en `types.ts`; extraído `metricColorVar` a
    `metricColors.ts`; helpers `hourFromT`/`formatHourLabel` en `format.ts`; `Widget` admite prop
    `to?` y se renderiza como `<Link>` (estados hover/active/focus-visible) → solo las cards en
    estado `data` navegan a `/metrica/:key`; ruta anidada bajo `AppLayout` (shell persiste).
  - *Detalle + gráficas:* `MetricDetailPage` (cabecera «‹ Hoy» + cifra-héroe + estados loading/
    error/vacío/sin-desglose + redirección si la métrica no es real). Gráficas SVG hechas a mano:
    `HourlyBarChart` (barras 0–23, pico resaltado — pasos/energía), `HeartRateChart` (banda mín–máx
    + línea media — FC), `SleepBreakdown` (barra de fases apilada por opacidad de `--m-sleep` +
    lista + inicio→fin), `DetailStats` reutilizable. Keyframe de entrada `.sp-chart-in` con apagado
    en `prefers-reduced-motion`. DESIGN.md ampliado con §12.
- **Revisor: APTO** (sin críticos ni importantes). typecheck · lint (`--max-warnings 0`) · build de
  Vite en verde; lógica de las 4 gráficas validada contra casos borde (cero, rango plano, sample
  único, fases ausentes, `t` corrupto). 3 hallazgos 🔵 menores; 2 corregidos en el momento
  (`transformOrigin` muerto en el `<rect>`, comentarios «STUB» obsoletos), 1 descartado (`key` por
  label, sin colisión real hoy).
- **Falta:** validación visual en navegador (375px + desktop, ambos temas) con datos horarios
  reales; merge `staging`→`main` + redespliegue.

- **Disparador:** el usuario quiere desglose **por horas** de pasos y FC (media horaria) para
  poder hacer gráficos. Inspección del export real de HAE: con *Time Grouping = Hour* cada
  métrica trae ~24 puntos/día con la hora en `date` (`"2026-06-24 15:00:00 +0200"`); el sueño
  sigue 1/día. Verificación cruzada: la suma horaria de pasos del 24/06 da **18.622**, idéntico al
  total diario que ya teníamos.
- **Backend (ejecutor):** reescrito `services/syncBiometrics.ts` (acumular por día/hora → agregar
  y persistir; helpers `dayOf`/`hourOf`). Modelo `models/DailyMetrics.ts` ampliado con series
  `heartRate.samples` / `steps.hourly` / `activeEnergy.hourly` (`{_id:false}`, `default:undefined`).
  Upsert idempotente (`$set` del objeto completo, no `$push`), retrocompatible con el formato
  diario. Nueva suite `syncBiometrics.test.ts` (9 tests, `mongodb-memory-server`) + fixtures;
  scripts `test`/`typecheck:test` en `package.json`, `tsconfig.test.json`.
- **Decisión de redondeo:** total diario = **suma de tramos ya redondeados** (cuadra con la serie
  visible). Detalle y matiz del invariante (puntos sin hora) en `decisiones.md` (2026-06-30).
- **Revisor: APROBADO, apto para desplegar.** typecheck verde · `test` 9/9 · `build` limpio
  (`dist/` sin tests/fixtures) · 7 tests de borde propios en verde · test de la suma no tautológico.
  3 hallazgos 🔵 menores (no bloquean): test de energía semi-tautológico, invariante Σserie==total
  no universal (documentado), `source` compuesto sin normalizar.
- **Siguiente:** desplegar (merge `staging`→`main` + rebuild) y **reenviar el JSON horario de la
  semana** al endpoint para poblar el histórico (pendiente el archivo completo del usuario; el que
  pasó se cortó a mitad del `heart_rate`).

## 2026-06-30 — Pestaña «Hoy» conectada a biometría real + botón Sincronizar funcional

- **Backend:** nuevo `GET /api/metrics/latest` (autenticado, `requireAuth`) que devuelve el
  `DailyMetrics` más reciente del usuario (`findOne({userId}).sort({date:-1})`); responde 200 con
  `{dailyMetrics:null}` si aún no hay datos (no 404). Archivos: `controllers/metrics.controller.ts`,
  `routes/metrics.routes.ts`, montado en `routes/index.ts`.
- **Frontend (Hoy):** eliminado el mock `data.ts`; la pantalla consume el endpoint vía hook
  `useTodayMetrics` (loading/error/ready + re-fetch on `visibilitychange`/`focus`). **4 cards
  reales** (Sueño·FC reposo·Pasos·Energía); **HRV/SpO2/Peso** (manuales) y **Readiness/Coach/
  Tendencia** en estado **«Próximamente»**; estado vacío global con CTA a Sincronizar; skeletons.
  `MetricWidget` refactorizado a tipo discriminado (`data`/`empty`/`soon`), delta opcional (sin
  histórico → sin delta inventado).
- **Sync:** el botón «Sincronizar» del header dispara el deep link del Atajo de iOS
  (`shortcuts://run-shortcut?name=SmartPeak`); al volver a la app, el hook re-fetchea solo.
- **Diseño:** token `--m-energy` (coral, **provisional**) en ambos temas + DESIGN.md §3b/§11b
  (estados de dato del widget: con-dato / sin-dato / próximamente / vacío).
- **Alcance acordado con el usuario:** «solo datos reales» (Readiness/Coach/Tendencia se posponen a
  la tarea de su cálculo + IA). Metas/ringPct provisionales anotadas en código.
- **Revisor: APROBADO** — typecheck/lint/build (client) + typecheck/build (server) en verde; cero
  colores literales; hook sin fugas (cleanup de listeners + guard anti-race); estados conformes a
  §11b. Único 🟡 (comentario del separador de miles en `format.ts`) corregido en el momento.
- **Pendiente:** validación visual en navegador (375px + desktop, ambos temas).

## 2026-06-30 — Entorno de desarrollo local en el VPS (`npm run dev`)

- **Contexto:** el usuario quiere correr `npm run dev` en el propio VPS (donde ya corre la app
  dockerizada en prod) y acceder por **túnel SSH** desde su portátil. Faltaban `client/.env` y
  `server/.env` (el backend hacía `process.exit(1)` por falta de `MONGODB_URI`/JWT; el cliente
  tenía `VITE_API_URL` undefined).
- **Cambios:** creados `client/.env` (`VITE_API_URL=http://localhost:4000/api`) y `server/.env`
  (reusa secretos JWT y credenciales Mongo del `.env` de Docker; `CLIENT_ORIGIN=http://localhost:5173`).
  El Mongo de prod **no exponía puerto al host**, así que se añadió `ports: "127.0.0.1:27017:27017"`
  al servicio `mongo` del `docker-compose.yml` (solo loopback, no accesible desde fuera del VPS) y se
  recreó el contenedor (datos intactos, volumen persistente).
- **Verificado:** backend de dev arranca, `[db] Conectado a MongoDB`, escucha en `:4000`,
  `/api/metrics/latest` → 401 (auth OK). Dev comparte la **misma BD que producción** (aceptado por el
  usuario "por el momento").

- **Decisión de diseño (a petición del usuario, ref. imagen):** la nav pasa de *numeral mono +
  label corto* a **icono + label largo**. Confirmados 3 puntos con el usuario: iconos custom finos
  (no Lucide), **Readiness compacto se mantiene arriba** como ancla, y la tab bar móvil adopta los
  mismos iconos. Filosofía: adoptar el concepto de la imagen **sin perder la finura** (bordes 1px,
  sin sombras ni tiles macizos). Documentado en **DESIGN.md §6** (revisada 2026-06-30) ANTES de implementar.
- **Implementación (ejecutor):** 4 iconos SVG custom en `components/icons/index.tsx` (`HoyIcon` dot,
  `TrendsIcon` barras, `TrainIcon` chevron, `ProfileIcon` persona; estilo `MoonIcon`, `currentColor`,
  `aria-hidden`). Campo `Icon` en `nav.ts`. `Rail.tsx` 66px→`w-[104px]`, icono+label apilados, activo =
  tile `bg-surface-2`. `TabBar.tsx` icono+label. `typecheck`+`lint` en verde.
- **Revisión (revisor): APROBADO** el código de nav (cumple DESIGN.md §6 y a11y; sin Lucide, monocromo,
  finura OK; `NavLink`/`aria-current`/`aria-hidden` correctos). Reserva NO de la nav: el working tree
  arrastra cambios de **otra(s) tarea(s) en curso** (refactor de `Hoy` con `data.ts` borrado, deep link
  de sync en `AppHeader`, backend `metrics`, `CLAUDE.md`) → posible sesión paralela. NO se commiteó
  (el usuario no lo pidió); si se commitea, **aislar solo los archivos de nav**.
- Efecto colateral correcto: como el refactor de `Hoy` borró el mock `data.ts`, `AppLayout` pasa
  `readinessScore={null}` y el Readiness del rail se ve en estado **"—" / próximamente** (no roto).

---

## 2026-06-30 — Persistencia biométrica + inventario del anillo (sync paso 2)

- **Inspección del shape real (paso 1 cerrado):** capturado el JSON real de HAE v2 con un volcado
  temporal en logs (luego **revertido**, sin dejar biometría en producción). El anillo KSIX SOLO
  exporta 4 métricas: `sleep_analysis`, `heart_rate` (Min/Max/Avg), `step_count`, `active_energy`
  (kJ). NO exporta HRV/SpO2/FC reposo/resp/temp/peso. Decidida ENTRADA MANUAL para HRV/SpO2/peso.
- **Flujo end-to-end probado desde el iPhone:** Atajo con acción **Export Health Metrics** (plan
  Basic; la REST API nativa es Premium) → **Obtener contenido de URL** POST con `x-sync-token` +
  `Content-Type: application/json` → 200. Periodo *Previous Day*, agregación *Días*, versión **v2**.
- **Persistencia (paso 2, ejecutor):** modelo `DailyMetrics` (doc diario por usuario, índice único
  `{userId,date}`, upsert idempotente con merge), `validation/sync.schema.ts` (Zod tolerante),
  `services/syncBiometrics.ts` (normaliza HAE→métricas, agrupa por día, kJ→kcal), controller
  reescrito (`parse`→`ingest`→`{message, days, saved}`).
- **Revisión adversarial: APROBADO.** El revisor levantó `mongodb-memory-server` y corrió pruebas
  REALES: 17/17 + Zod (9 payloads) + casos límite. Confirmado lo crítico: merge sin pisar campos
  manuales/readiness, cast `userId`→ObjectId, idempotencia, índice único bajo concurrencia. Solo
  hallazgos 🟢 bajos (E11000 en carrera teórica, "último gana" intradía) no bloqueantes.
- Commit + merge a `main` + redeploy backend en producción. **Pendiente:** cálculo Readiness,
  entrada manual (UI + endpoint), vista Hoy/Tendencias con datos reales, tests permanentes.

## 2026-06-29 — Endpoint de sincronización biométrica (recepción · paso 1: inspección)

- **Petición**: añadir el endpoint receptor del POST del Atajo de iOS (Health Auto Export) sin
  exponer el backend al exterior. Partida: un snippet del usuario en JS (Express pelado).
- **Aclaración clave (al usuario)**: el backend NO necesita exponerse — `/api/*` ya es público vía
  el nginx del frontend (mismo origen). El endpoint es `POST /api/sync/health`, **cero cambios de
  infra**. "Exponer solo ese endpoint" se resuelve con auth (token), no con red.
- **Decisiones (consultadas al usuario)**: auth por **token POR USUARIO** (`syncToken`, header
  `x-sync-token`) en vez de API key global; **primer paso solo inspección** (log del shape, sin
  persistir); **disparo = automático (HAE programado) + botón deep link**, descartado el push
  Telegram/Pushover. Detalle en `decisiones.md` (2026-06-29 · Endpoint de sincronización).
- **Implementado** (ejecutor): `models/User.ts` (+`syncToken` `select:false`, índice unique+sparse,
  oculto en `toJSON`), `middleware/syncAuth.ts` (`requireSyncToken`), `controllers/sync.controller.ts`
  (`syncHealth`, inspección de shape), `routes/sync.routes.ts` (`POST /health`, parser propio 2mb
  TRAS la auth), `app.ts` (monta `/api/sync` antes del json global), `scripts/sync-token.ts` + npm
  `sync:token`.
- **Revisión adversarial**: APROBADO con reservas. Pruebas HTTP reales: 150kb→200, 3MB→413 (límite
  propio), sin token→401 sin parsear body, ruta normal 150kb→413 (confirma por qué sync va antes del
  json global). Sin fugas: el token nunca sale en respuestas/logs (salvo el alta única en el script).
- **Reservas resueltas (orquestador)**: el `typecheck` no cubría `scripts/` → añadido
  `tsconfig.scripts.json` + `typecheck:scripts` (encadenado en `typecheck`); el log de tamaño pasó a
  `Buffer.byteLength` (bytes reales, no UTF-16). `npm --prefix server run typecheck` (src + scripts)
  en verde.
- **Pendiente**: probar con el JSON real del Atajo para ver el shape → modelar/persistir la
  biometría; botón deep link en la UI; endpoint para generar/rotar el token desde la web. Sin
  commitear.

## 2026-06-29 — Dockerización y despliegue (commit + push a staging y main)

- **Objetivo**: desplegar en el VPS propio (84.247.191.244, Debian 13) con Docker tras el Nginx
  Proxy Manager existente. Se exploró por SSH el proyecto hermano `total-grind` para replicar su
  patrón de `docker-compose` (frontend nginx + backend node + mongo; red `reverse_proxy_network`
  external, compartida con NPM `npm-app`).
- **Artefactos creados**: `docker-compose.yml` (3 servicios), `server/Dockerfile` (multi-stage
  TS→dist), `client/Dockerfile` (Vite→nginx) + `client/nginx.conf` (SPA + proxy `/api`),
  `client/.dockerignore`, `server/.dockerignore`, `.env.example`. `app.ts`: `trust proxy`.
- **Arquitectura**: mismo origen (el frontend proxya `/api` al backend) ⇒ `VITE_API_URL=/api`;
  resuelve la cookie httpOnly `secure`+`sameSite=lax`. Backend y mongo solo en red `internal`.
  Dominio `smartpeak.joan-coll.com` (DNS ya resuelve al VPS). Detalle en `decisiones.md`.
- **Verificación**: `npm run build` (server `tsc` + client `vite build`) en verde antes de
  commitear; typecheck del server tras el cambio en `app.ts` también verde.
- **Git** (a petición del usuario, por git en vez de rsync): commits en `staging` + merge a
  `main`. El repo no tenía `origin`; resultó ser `github.com/Joaaan09/SmartPeak` (cuenta personal
  del usuario). El Mac tenía guardadas credenciales de **FlowProp** (sin permiso) → se corrigió
  la **autoría** de los commits a `Joan Coll <…+Joaaan09@users.noreply.github.com>` y el usuario
  hizo el push. Ver memoria `git-identity`.
- **Despliegue en el VPS (hecho por el orquestador vía SSH)**: clonado en `~/servers/smartpeak`,
  `.env` generado con `openssl` (chmod 600), `docker compose up -d --build`. El usuario configuró
  el **Proxy Host en NPM** (TLS Let's Encrypt OK).
- **2 bugs encontrados y resueltos en producción**:
  1. *Backend no conectaba a Mongo al arrancar* (`ECONNREFUSED`): el backend arrancaba antes que
     Mongo. **Fix**: healthcheck en `mongo` + `depends_on: condition: service_healthy`.
  2. *502 en `/api`*: el `proxy_pass` de nginx usaba `backend`, nombre que **colisiona** con los
     `backend` de otros proyectos en la red compartida `reverse_proxy_network` (el DNS de Docker
     resolvía al contenedor equivocado). **Fix**: apuntar a `smartpeak-backend` (nombre único) con
     resolver dinámico. Commit `fix(deploy)`.
- **✅ RESULTADO**: `https://smartpeak.joan-coll.com` sirve la SPA (200) y `/api/health` responde
  `{"ok":true}` (200) tras NPM + TLS. App **desplegada y operativa**. Pendiente menor: el VPS tiene
  los 2 archivos del fix aplicados a mano; se sincronizará con `git reset --hard origin/main` tras
  el push.

## 2026-06-29 — Realineado del sistema de diseño con la LANDING

- **Petición del usuario**: que la app siga el estilo de la landing (`logos/SmartPeak Landing.html`)
  — misma letra, mismos colores, misma estructura — manteniendo un mínimo el tono Apple; adaptar
  tanto los documentos de directrices como el dashboard.
- **Extracción del sistema de la landing**: es un export "bundled" (SVG + JS). Identificado por
  grep/render: fuentes **Space Grotesk** (UI) + **Space Mono** (datos/eyebrows), tokens tinta
  (`--bg #0E0F12`, `--surface #16181D`, `--text #F4F4F1`…) / papel (`#EFEFEC`/`#FFFFFF`/`#14161B`…),
  chrome **100% monocromo** (el coral `#FF8A80` era solo el toast de error del bundler, no diseño),
  readiness como **barra lineal**, coach en burbujas monocromas. El "pico" (chevron) es la marca.
- **3 dilemas consultados al usuario** (la landing chocaba con reglas duras de DESIGN.md):
  color de datos → **color solo en datos** (monocromo total anotado como opción futura);
  readiness → **barra lineal**; coach → **monocromo** (sin gradiente IA). Registrado en
  `decisiones.md`.
- **Implementado** (orquestador, con contexto cargado): `index.html` (Google Fonts + theme-color
  `#0E0F12` + favicons), `tokens.css` (paleta tinta/papel + fuentes + accent monocromo, sin
  `--ai-grad`), `tailwind.config.js` (sin `bg-ai-grad`), `styles/index.css` (utilidad `.eyebrow`,
  coach sin gradiente, keyframe `pulse-led`), `ReadinessWidget` (anillo→barra lineal con count-up),
  `MetricWidget`/`TrendWidget`/`AppHeader`/`CoachWidget` (eyebrows mono, coach monocromo),
  nuevos `PeakMark`/`Wordmark` (pico de marca), assets en `client/public[/brand]`.
- **Docs**: `DESIGN.md` (§0/§1/§2/§3/§6/§7/§8/§9 actualizados, §3c gradiente RETIRADO),
  `CLAUDE.md §5`, `mockup-mono.html` reescrito al nuevo sistema.
- **Verificación**: `typecheck` + `lint` en verde; **screenshot headless** del `mockup-mono.html`
  en oscuro y claro → fiel a la landing. `revisor` lanzado sobre el cambio.
- **Sin commitear** (a la espera del OK visual del usuario).

## 2026-06-27 (noche) — Arranque MERN + Autenticación

- **Decisiones de arranque** (vía pregunta al usuario): stack en **TypeScript**, onboarding
  **completo de 5 pasos**, sesión con **JWT**. Registradas en `decisiones.md`.
- **Scaffolding monorepo** (orquestador → 2 ejecutores en paralelo):
  - `server/`: Express + TS (ESM) + Mongoose + JWT + zod + bcrypt + helmet. `connectDB` que no
    tumba el server si Mongo no responde. `GET /api/health` OK.
  - `client/`: Vite + React 18 + TS + **Tailwind v3 con tokens del mockup** (oscuro default +
    `body.paper`), Space Mono, ThemeProvider, esqueleto de rutas.
  - Raíz: `package.json` con `npm run dev` (concurrently), `build`, `typecheck`, `lint`,
    `install:all`. CLAUDE.md §10 con comandos reales.
- **Autenticación** (ejecutor + revisor):
  - Modelo `User` (role Power/Hiper/Salud, sex, físicos, `preferences.theme`; `toJSON` oculta
    `passwordHash`). Rutas register/login/refresh/logout/me + `PATCH /users/me` (rol editable).
  - Frontend: login + **wizard premium de 5 pasos** (Cuenta·Perfil·Objetivo·Físicos·Listo),
    AuthContext (access en memoria + refresh→me al montar), rutas protegidas, primitivos UI
    reutilizables. Motion §8, a11y §10/§11, chrome monocromo, datos en mono.
- **Revisión adversarial**: aprobado, sin críticos ni fugas de seguridad. Corregidos: lint en
  rojo (extraído `useTheme` a módulo propio), single-flight del refresh concurrente, mono de
  email en el resumen, log de `MONGODB_URI` en errores. **typecheck/build/lint en verde**.
- **Pendiente**: smoke real con un MongoDB (no hay BD en el equipo). Trabajo en rama
  `feat/scaffold-auth`, **sin commitear** (a la espera de decidir commit a `staging`).

## 2026-06-28 — MongoDB local + bug "Cargando" (StrictMode)

- **MongoDB local de desarrollo** sin instalar nada en el sistema: `mongodb-memory-server` +
  `npm run db:dev` (server/scripts/mongo-dev.mjs), fijado al 27017 con datos persistentes en
  `server/.mongo-data` (gitignored). Levantados Mongo + API (4000) + Vite (5173).
- **Smoke e2e real**: `POST /auth/register` → **HTTP 201**, respuesta con `id` y **sin
  `passwordHash`** (confirma `toJSON` con doc real, que el revisor no pudo verificar antes).
- **Bug encontrado al validar en navegador**: la app se quedaba en "Cargando tu sesión"
  (spinner infinito) en `/login`. Causa: en `AuthContext`, el guard `didInit` (useRef) chocaba
  con el flag `cancelled` bajo el **doble montaje de React.StrictMode** (dev): el 2.º montaje
  salía por el guard y el 1.º no llegaba a `setLoading(false)` por estar cancelado. **Fix**:
  quitado el guard (el single-flight de `tryRefresh` ya deduplica). Verificado con **render
  headless de Chrome**: ahora pinta el login. Commits `2feef62` (fix) y `61f2cb3` (tooling).
- **Lección**: el revisor audita en estático y no simula el timing de StrictMode; conviene
  validación runtime real (navegador headless) antes de dar por bueno un flujo de UI con efectos.
- Nota de entorno: instancias de Vite duplicadas de pruebas de agentes ocupaban 5173/5174 con
  caché `.vite` obsoleta; se limpiaron y se dejó una sola en 5173.
- ✅ **Confirmado por el usuario**: tras el fix, el login/registro funciona en su navegador.

## 2026-06-28 — Shell + pestaña Hoy (modo vista)

- **Git**: commit del arranque+auth en `feat/scaffold-auth` → merge a `staging` (`cbf1999`).
  Nueva rama `feat/hoy-shell` desde `staging`. `main` queda en el baseline (regla §9).
- **Shell responsive** (ejecutor + revisor): `AppLayout` con regleta desktop (Readiness compacto
  + nav numeral/label + toggle tema) y **tab bar inferior móvil** con `env(safe-area-inset)`;
  header de pestaña (wordmark, sync, píldora de rol REAL del user, "Sincronizar"); tira meta.
  Rutas anidadas `/ /tendencias /entreno /perfil` con `<Outlet/>`; logout movido a Perfil.
- **Pestaña Hoy** (modo vista): dashboard bento 12-col (desktop) que reflowa a stack 2-col
  (móvil). Widgets reutilizables: Readiness (count-up 800ms + anillo `--m-rdy`), Coach IA
  (gradiente exclusivo + LED), MetricWidget ×4 (anillo `--m-*` por métrica), TrendWidget (HRV
  7d). `data.ts` mock tipado (placeholder hasta el sync). Eliminados HomePage y ThemeToggle
  flotante provisionales.
- **Revisión adversarial**: APROBADO, sin críticos/altos/medios; chrome monocromo, gradiente IA
  solo en coach, motion §8 y a11y correctos. Nits aplicados: numeral del rail a `font-bold`
  (Space Mono solo carga 400/700; evita faux-bold) y quitada clase `disp` sobrante.
- `typecheck/build/lint` en verde. Merge `feat/hoy-shell` → `staging` (`c10ad53`).
- **No validado en navegador** (el revisor solo audita código): pendiente ver Hoy a 375px y
  desktop en ambos temas. **Pendiente** modo edición (Iteración B) y smoke e2e con Mongo.

## 2026-06-27 (tarde)

- Instaladas **skills de diseño** en `~/.claude/skills/`: `emil-design-eng`,
  `review-animations`, `impeccable`, `design-taste-frontend` (+ plugin oficial
  `frontend-design` vía marketplace local). Adoptadas como **guía de craft**, subordinadas a
  DESIGN.md. Registrado en `decisiones.md`.
- **CLAUDE.md**: §5 ahora indica seguir las directrices de las skills en UI (motion/interacción)
  con DESIGN.md como árbitro; §9 añade convención de componentes; a11y enlazada a DESIGN.md §10.
- **DESIGN.md**: §0 amplía vetos (incl. qué NO adoptar de las skills); §8 reescrita con catálogo
  de motion (curvas, duraciones, GPU, count-up/anillos, stagger, reduced-motion); nueva §10
  (a11y) y §11 (interacción y estados: 8 estados, focus-visible, formularios, OKLCH).
- **mockup-mono.html** reworkeado con las skills: tokens de easing, press `scale(.97)`,
  `:focus-visible`, hover gated a punteros finos, entrada escalonada de widgets, count-up
  expo 800ms y `prefers-reduced-motion`. Verificado (llaves balanceadas, hover gated).
- Exploración (descartada): se hicieron 2 mocks "siguiendo SOLO las skills" (indigo
  thinking-tool y recuperación cálida) vía `/impeccable shape`, solo para ver el resultado.
  **Borrados a petición del usuario**: prefiere el mock que ya teníamos. El mock canónico es y
  sigue siendo `mockup-mono.html` (DESIGN.md).

## 2026-06-27

- Creado el **sistema multiagente** en `.claude/agents/`: `explorador` (solo lectura),
  `ejecutor` (lectura + escritura + Bash) y `revisor` (lectura + Bash, sin escritura).
  Patrón orquestador (sesión principal) → ejecutor → revisor + explorador de apoyo.
- Montado el **harness** del proyecto:
  - `CLAUDE.md` con las instrucciones (qué es, flujo Pull, roles IA, optimización de costes,
    diseño como restricción dura, orden de construcción, convenciones).
  - `.progreso/` con `estado.md`, `plan.md`, `decisiones.md`, `log.md`.
  - `.claude/agents/` y `.claude/skills/` (vacíos, con README de uso).
  - `scripts/init.sh` para arrancar sesión mostrando el estado.
- Documentación de partida ya existente: `DESIGN.md`, `mockup-mono.html`, `app.txt`.
- **Sin código todavía** (sin scaffolding MERN).
