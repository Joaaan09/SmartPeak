# Decisiones — ¿por qué se hizo así?

> ADR ligero. Una entrada por decisión relevante. Formato: fecha · decisión · motivo · alternativas descartadas.

---

### 2026-06-30 · Ubicación de la entrada manual de biometría: teclado por dato, foto por día

- **Decisión:** las vías de entrada manual (ver `dispositivo.md` §4) se ubican según la
  **granularidad del dato**, no todas en el mismo sitio:
  - **Teclado (un valor)** → en la **página de detalle de cada métrica** (`/metrica/:metricKey`):
    añadir/editar ese dato, incluido corregir días del histórico. Es el **hogar** del dato.
  - **Foto / captura (multi-métrica = volcado del día)** → **un único flujo central
    «Importar desde captura»**, lanzado como **acción desde `Hoy`** (hoja «Añadir datos de hoy»);
    la IA extrae y **reparte cada valor a su métrica**.
  - **Atajo de iOS** → sin UI (POST directo, menor fricción, día a día).
  - **Revisión** de lo leído con baja confianza → **aviso ligero en `Hoy`** («N datos sin
    revisar →»), no pantalla propia.
- **Motivo:** teclado y foto tienen **granularidad distinta** (un dato vs. el volcado del día),
  así que no van juntos: poner «Importar foto» dentro de la página de HRV sugiere que la captura
  es solo de HRV, cuando una pantalla del anillo trae varias métricas a la vez (sueño +
  FC-sueño + HRV + SpO₂…). La barra de navegación es para **destinos**, no acciones esporádicas.
- **Alternativas descartadas:**
  (a) **UI en Perfil** (lo que apuntaba `estado.md`) — Perfil es **configuración** (rol, tema,
      token de sync, PWA); un dato que se teclea a diario ahí es fricción y sitio poco natural.
      Refuerzo: el **peso** vive en dos campos (`User.weight` estático vs. `metrics.weight.kg`
      diario) → el día a día va a `metrics`, no al perfil.
  (b) **Pestaña dedicada** en la nav solo para subir capturas — desbalancea la barra (5 ítems
      apretados en móvil) y da peso de primer nivel a una acción esporádica (el día a día ya es
      el Atajo de iOS).
  (c) **«Importar foto» por métrica** filtrando solo ese dato — desperdicia el resto de la
      captura (multi-métrica) u obliga a subir la misma foto en varias páginas. Si acaso, un
      atajo que abra el **mismo flujo central**, pero no de inicio (KISS).

---

### 2026-06-30 · Scroll en `<main>` (app-shell), no en el documento — móvil incluido

- **Decisión:** el shell autenticado (`AppLayout`) ocupa exactamente el viewport
  (`h-[100dvh]` + `overflow-hidden`) y el scroll vive **en `<main>`** (`overflow-y-auto`),
  tanto en desktop como en **móvil** (antes el móvil scrolleaba el documento/body). Se añade
  `overscroll-behavior-y: contain` al `<main>`. La `TabBar` sigue `position: fixed` + blur,
  sin cambios.
- **Motivo:** en la **PWA standalone de iOS** la TabBar se desanclaba y "flotaba" a media
  altura al hacer scroll. Es un bug conocido de WebKit con `position: fixed` + `backdrop-filter`
  **cuando el que scrollea es el body**. Con el body estático (overflow-hidden) y el scroll
  movido a un contenedor interno, WebKit recompone bien la capa fija y **se conserva el blur**
  (la barra sigue translúcida sobre el contenido que pasa por debajo). Seguro porque ninguna
  página hace `window.scrollTo`/scroll-restoration ni usa `position: sticky`.
- **Alternativas descartadas:** (a) **quitar `backdrop-filter`** y dejar la barra opaca —
  arregla el bug pero sacrifica el efecto de blur de la landing/DESIGN; (b) **hacks de
  compositing** en la propia TabBar (`translateZ(0)`/`will-change`) — anularían el
  `backdrop-filter` en WebKit; (c) **convertir la TabBar en parte del flujo** (no `fixed`) —
  el contenido dejaría de pasar por detrás, perdiendo el blur sobre el contenido.
- **Nota DESIGN.md §11:** `100dvh` es estable en standalone (no hay toolbar dinámica); en
  Safari normal el contenedor se ajusta sin rebote del body.

---

### 2026-06-27 · Harness del proyecto basado en CLAUDE.md + .progreso/

- **Decisión:** estructurar el proyecto con `CLAUDE.md` (≤200 líneas) como instrucciones,
  una carpeta `.progreso/` para el estado entre sesiones, y `.claude/{agents,skills}`.
- **Motivo:** mantener el contexto entre sesiones sin inflar CLAUDE.md; separar instrucciones
  estables (CLAUDE.md), estado mutable (.progreso) y diseño (DESIGN.md).
- **Alternativas descartadas:** meterlo todo en un único README (se vuelve inmanejable).

---

### 2026-06-27 · Sistema multiagente orquestador / ejecutor / revisor / explorador

- **Decisión:** la sesión principal actúa como **orquestador** (planifica y delega, no
  programa) y se apoya en tres subagentes con tools restringidas por rol:
  `explorador` (Read/Grep/Glob), `ejecutor` (Read/Write/Edit/Grep/Glob/Bash) y
  `revisor` (Read/Grep/Glob/Bash, sin Write/Edit).
- **Motivo:** proteger la ventana de contexto del orquestador (el trabajo pesado de leer/
  implementar/verificar ocurre en el contexto de los subagentes, que devuelven solo
  resúmenes) y separar implementación de verificación con postura adversarial del revisor.
- **Alternativas descartadas:** que el orquestador escriba el código directamente (consume
  contexto y mezcla roles); dar Write al revisor (rompe la separación implementar/verificar).

---

### 2026-06-27 · Skills de diseño instaladas como guía (subordinadas a DESIGN.md)

- **Decisión:** instalar 4 skills de diseño frontend en `~/.claude/skills/` y adoptarlas como
  **directrices de criterio** del proyecto: `emil-design-eng` y `review-animations` (Emil
  Kowalski), `impeccable` (pbakaus) y `design-taste-frontend` (taste-skill v2). Antes se
  instaló también el plugin oficial `frontend-design`.
- **Motivo:** suben el listón de craft (sobre todo en **motion/animación** e interacción) y
  comparten la postura anti-"AI slop". Se integró en `DESIGN.md` lo compatible: catálogo de
  motion (curvas `ease-out`, <300ms, solo `transform`/`opacity`, count-up/anillos), 8 estados
  interactivos + `:focus-visible`, color OKLCH semántico, jerarquía por espacio+peso.
- **Regla de prelación (dura):** **ante cualquier conflicto, manda `DESIGN.md`.** Las skills
  son herramienta/inspiración, no autoridad. Vetos explícitos (anotados en DESIGN.md §0):
  no subir los "dials" de variance/riesgo estético; **no** sustituir la fuente del sistema +
  mono por fuentes display "con personalidad"; conservar "el dato es el héroe" pese a que
  `impeccable` desaconseje el "hero-metric" (mostramos datos reales, no decorativos);
  ignorar la arquitectura de landing/marketing de taste-skill (está fuera de alcance: es una
  app de producto, no una landing); mantener el gradiente reservado al coach IA.
- **Cómo se instalaron:** manualmente (clonar repo → copiar `SKILL.md` y dependencias), no vía
  `npx skills add`, para no ejecutar un instalador npm opaco. El plugin oficial se sirvió desde
  una marketplace local (`anthropic-fe-local`) porque el CLI 2.1.7 no valida el esquema nuevo
  de la marketplace oficial.
- **Riesgo asumido:** varias skills son auto-invocables y se solapan; pueden dispararse a la
  vez en tareas de UI e inflar contexto. Mitigación: DESIGN.md como árbitro único.

---

### (heredadas de DESIGN.md / app.txt — referencia)

Estas ya estaban tomadas antes del harness; se listan aquí para tenerlas a mano:

- **Stack MERN** con estrategia de datos **"Pull"** (el usuario dispara la sincronización
  desde un Atajo de iOS). Motivo: uso mayoritario en móvil + datos de Salud de Apple.
- **Optimización de costes de IA**: preprocesar medias en JS, forzar JSON corto y cachear el
  análisis del día. Motivo: evitar llamadas redundantes y tokens innecesarios.
- **Sin color de marca; el color vive solo en los datos** (DESIGN.md §3). Motivo: evitar el
  look genérico de IA y dar tono Apple-grade.

---

### 2026-06-27 · Arranque MERN: TypeScript, monorepo client/server, JWT, onboarding de 5 pasos

- **Decisión (consultada al usuario):**
  - **TypeScript** en todo el stack (client y server), no JS puro.
  - **Monorepo** simple `client/` + `server/` con un `package.json` raíz que orquesta ambos
    vía `concurrently` (`npm run dev` levanta los dos). Sin workspaces formales (innecesario aún).
  - **Sesión con JWT**: access token de 15m **en memoria** en el cliente (no localStorage) +
    refresh de 30d en **cookie httpOnly** (`sameSite lax`, `secure` en prod, `path /api/auth`).
  - **Onboarding completo de 5 pasos** en el registro: Cuenta · Perfil (nombre, sexo, fecha
    nacim.) · Objetivo/rol · Físicos (altura, peso, peso objetivo) · Listo.
- **Motivo:** TS da seguridad de tipos en los modelos biométricos y en el contrato API (caro de
  revertir luego). JWT encaja con el uso mayoritario en móvil y con el Atajo de iOS que hace
  POST al backend. Recoger sexo/edad/físicos en el alta permite **baselines reales de readiness
  desde el día 1** y da el tono premium pedido. El rol es editable luego (`PATCH /users/me`).
- **Alternativas descartadas:** JS puro (sin tipos en datos sensibles); sesión cookie-only
  (menos cómoda para clientes no-navegador como el Atajo); registro mínimo email+rol (no habilita
  análisis biométrico real desde el inicio).
- **Implementación:** access en memoria + rehidratación `refresh→me` al montar; refresh con
  single-flight (deduplica 401 concurrentes); bcrypt cost 12; login con 401 genérico.

### 2026-06-27 · Tailwind v3 mapeado a los tokens CSS (cero colores literales)

- **Decisión:** Tailwind v3 (estable) con `theme.colors`/`fontFamily`/`borderRadius`/easing
  **referenciando las CSS custom properties** del mockup (`surface: 'var(--surface)'`, etc.).
  Los hex viven SOLO en `client/src/styles/tokens.css`; los componentes consumen tokens.
- **Motivo:** cumple la regla dura de DESIGN.md ("solo tokens, cero colores literales") sin
  renunciar a la ergonomía de utilidades Tailwind. Un único sitio para cambiar los `--m-*`.
- **Alternativas descartadas:** Tailwind v4 (migración de config fuera de alcance del arranque);
  CSS-in-JS o estilos sueltos (más difícil de auditar la regla de "color solo en datos").

### 2026-06-27 · Flujo de ramas main / staging (regla dura)

- **Decisión (del usuario, en CLAUDE.md §9):** todo el desarrollo ocurre en **`staging`** (o
  ramas de feature que se mergean a `staging`); **`main` es solo para cambios ya validados**.
- **Motivo:** mantener `main` como rama estable/de release; integrar y validar en `staging`.
- **Cómo se aplica:** el trabajo de arranque vive en `feat/scaffold-auth` → se mergeará a
  `staging`; a `main` solo cuando esté validado (incluye smoke e2e con Mongo real).

---

### 2026-06-29 · Alinear el sistema de diseño con la LANDING

- **Decisión (del usuario):** la app debe seguir el estilo de la **landing** (`logos/SmartPeak
  Landing.html`): **misma letra, mismos colores, misma estructura**, manteniendo un mínimo el
  tono Apple. Cambios concretos aplicados:
  1. **Tipografía**: la UI pasa de la fuente del sistema a **Space Grotesk**; los datos y los
     **eyebrows/labels técnicos** (mayúsculas) van en **Space Mono** (utilidad `.eyebrow`). El
     sistema queda solo como *fallback*. (Deroga el veto previo "usar la fuente del sistema".)
  2. **Paleta**: de "negro iOS" a **tinta** (oscuro: `--bg #0E0F12`…) / **papel** (claro:
     `--bg #EFEFEC`…), valores copiados tal cual de la landing. `--accent` monocromo = blanco/tinta
     (el botón blanco de la landing).
  3. **Readiness**: ~~pasa de anillo a barra lineal~~ → **REVERTIDO el mismo día** (ver entrada
     siguiente): vuelve el **anillo**, ahora con **color por estado**.
  4. **Coach IA monocromo**: se **retira el gradiente "Apple Intelligence"** (token `--ai-grad`,
     barra superior, badge en gradiente, LED de color). El coach se distingue por superficie
     elevada + contenido + LED neutro. (Deroga "mantener el gradiente reservado al coach IA".)
  5. **Marca**: el "pico" (chevron) entra en el wordmark/header y como favicons; assets en
     `client/public/` y `client/public/brand/`.
- **Consultado al usuario (3 bifurcaciones donde la landing chocaba con reglas duras):**
  - **Color de los datos** → "**color solo en datos**" (cada métrica su `--m-*`), por la utilidad
    de escaneo de un dashboard real. La opción **monocromo total** (100% como la landing) queda
    **anotada como alternativa futura** (DESIGN.md §3).
  - **Readiness** → barra lineal (como la landing).
  - **Coach** → monocromo (sin gradiente).
- **Archivos tocados:** `client/index.html` (fuentes/theme-color/favicons), `tokens.css`,
  `tailwind.config.js` (quita `bg-ai-grad`), `styles/index.css` (`.eyebrow`, coach monocromo),
  `ReadinessWidget` (anillo→barra), `MetricWidget`/`TrendWidget`/`AppHeader`/`CoachWidget`
  (eyebrows mono), `PeakMark`/`Wordmark` nuevos, `mockup-mono.html` reescrito, `DESIGN.md` y
  `CLAUDE.md §5`.
- **Alternativas descartadas:** monocromo total ya (se pospone); mantener el anillo de Readiness
  como firma (se cambia a barra por fidelidad a la landing); conservar el gradiente IA (rompía la
  coherencia con la landing).

---

### 2026-06-29 · Colores por métrica `--m-*` DEFINIDOS

- **Decisión (del usuario):** fijar el color por métrica para los valores (recuperación, sueño,
  VFC, FC reposo, pasos, peso). Antes eran placeholders iOS provisionales.
- **Hallazgo importante:** el usuario pedía "usar de referencia una landing con color en los
  anillos", pero **ambos HTML de `logos/` (landing y logo) son 100% monocromos** (solo neutros
  tinta/papel + el coral del toast de error del bundler). **No hay paleta de color que copiar.**
  Por tanto la paleta se **diseñó** para armonizar con la marca, no se extrajo.
- **Paleta (dark / papel)** — ver DESIGN.md §3b:
  rdy `#0A84FF/#0A78E6` · hrv `#2BC9B8/#0E9484` · rhr `#FF6482/#E23E64` ·
  sleep `#8278F6/#5F58E0` · steps `#FF9F0A/#C2700A` · weight `#E5B83C/#9C7A1A`.
- **Criterios:** hues separados; distintos de `--pos`/`--neg` (la HRV ya no es el verde de señal
  ni la FC reposo el rojo de señal; el sueño ya no es casi el azul de readiness); legibles en
  ambos temas (papel usa variantes más profundas). Verificado por screenshot del mockup en
  oscuro y claro.
- **Alternativas descartadas:** mantener los placeholders iOS (colisionaban con las señales);
  monocromo total (el usuario elige color en los datos — queda como opción futura, abajo).

### 2026-06-29 · Readiness vuelve a ANILLO, con color por estado

- **Decisión (del usuario):** descartar la barra lineal en Preparación y **volver al anillo**;
  además, el anillo debe tener **otro color** que el azul fijo de antes.
- **Resolución:** el **color del anillo refleja el ESTADO** de recuperación — verde `--pos`
  (Recuperado) / ámbar `--warn` (Moderado) / rojo `--neg` (Fatiga). El número del centro sigue
  neutro (el aro da el color). La **mini-barra del rail** (CompactReadiness) también pasa a
  colorearse por estado, para coherencia en toda la app (se le pasa `state` desde AppLayout→Rail).
- **`--m-rdy`** (azul) deja de pintar el anillo; queda **reservado** para gráficas de readiness
  (p. ej. su tendencia). Sigue definido en tokens.
- **Archivos:** `ReadinessWidget.tsx` (barra→anillo, stroke por estado), `CompactReadiness.tsx`
  (+`state`, barra por estado), `Rail.tsx`/`AppLayout.tsx` (plumbing de `state`), `mockup-mono.html`
  (anillo + JS de dashoffset + rail verde), `DESIGN.md §1/§3b/§7/§8`.
- **Nota:** la landing **no** tiene anillo de readiness coloreado (es monocroma); el patrón
  "anillo por estado" se diseñó aquí.

---

### 2026-06-29 · Despliegue con Docker + Nginx Proxy Manager (servidor propio)

- **Decisión:** desplegar SmartPeak en el VPS propio (84.247.191.244, Debian 13) con **Docker
  Compose**, detrás del **Nginx Proxy Manager** ya existente (contenedor `npm-app`), replicando
  el patrón validado del proyecto hermano `total-grind`. Tres servicios: `frontend`
  (nginx:alpine sirve la SPA y proxya `/api`), `backend` (Node, `node dist/index.js`) y `mongo`
  (mongo:7 con auth y volumen `smartpeak_mongo_data`).
- **Redes:** `frontend` en `reverse_proxy_network` (external, compartida con NPM) + `internal`;
  `backend` y `mongo` SOLO en `internal`. El backend no se expone al proxy (el tráfico entra por
  el nginx del frontend ⇒ menos superficie). Dominio **smartpeak.joan-coll.com** (DNS ya apunta
  al VPS); TLS lo termina NPM (Let's Encrypt): el usuario configura el Proxy Host.
- **Mismo origen (clave):** todo cuelga de un único host y el nginx del frontend proxya `/api`
  al backend ⇒ `VITE_API_URL=/api` (relativa, inyectada en build time). **Obligatorio** porque
  la cookie de refresh es `httpOnly` + `secure` + `sameSite=lax`: en dominios distintos el login
  se rompería. `app.set('trust proxy', 1)` para IP/`req.secure` correctos tras el proxy.
- **Imágenes:** server multi-stage (compila TS con `tsc` → runtime con `npm ci --omit=dev`),
  client multi-stage (build Vite → nginx:alpine). Healthcheck del backend a `/api/health`.
- **Secretos:** `.env` SOLO en el servidor (gitignored): `MONGO_USER/PASSWORD`,
  `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_ORIGIN`. `.env.example` documenta el formato.
- **Subida del código:** por **git** (a petición del usuario; descartado rsync): commit/push a
  `staging` y `main`. NPM y el `docker compose up` en el VPS los gestiona el usuario.
- **Alternativas descartadas:** MongoDB Atlas (se prefiere contenedor propio autocontenido);
  exponer el backend directamente al proxy (innecesario); servir client y API en subdominios
  distintos (rompe la cookie httpOnly).

---

### 2026-06-29 · Endpoint de sincronización biométrica (recepción del Atajo de iOS)

- **Decisión:** el Atajo de iOS (Health Auto Export) envía el JSON de Salud por **HTTP POST a
  `POST /api/sync/health`**. **No se expone el backend al exterior**: la ruta cuelga del `/api` que
  el nginx del frontend ya proxya (mismo origen) ⇒ **cero cambios de infraestructura** (ni redes,
  ni NPM, ni `reverse_proxy_network`). "Exponer solo ese endpoint" se resuelve en la capa de
  aplicación (auth), no en red — todo `/api/*` ya es público por necesidad (el navegador llama
  `/api/auth`, etc.).
- **Auth por token POR USUARIO (no API key global):** cada `User` guarda un `syncToken` opaco
  (`crypto.randomBytes(32).base64url`, campo `select:false`, índice `unique+sparse`, borrado en el
  `transform` de `toJSON`). El Atajo lo manda en el header **`x-sync-token`**; el middleware
  `requireSyncToken` resuelve el dueño con `User.findOne({ syncToken })`. Ventajas: revocable por
  usuario, escalable a multiusuario, y la comparación la hace Mongo (sin timing-attack en JS).
  **Descartada** la API key global del snippet inicial (no identifica al usuario, no revocable).
- **Límite de body SOLO en esa ruta:** `/api/sync` se monta con su propio
  `express.json({ limit: '2mb' })` **antes** del `express.json()` global (~100kb) y **después** de
  la auth (no se parsean 2mb sin token válido). Así el resto de `/api` mantiene el límite estricto y
  solo sync acepta el payload grande. El `2mb` es **provisional** (a medir con el payload real);
  recordar que hay **3 capas** de límite (NPM → nginx frontend `client_max_body_size` → Express) y
  todas deben permitir el tamaño.
- **Primer paso = solo inspección:** el endpoint loguea la estructura del JSON y responde 200; aún
  **no persiste** (no hay modelo de biometría todavía). Se modelará la persistencia con el shape
  real ya observado. Script `npm run sync:token -- <email>` para asignar el token y probar sin
  login (muestra el token una sola vez).
- **Disparo de la sync (cómo se ejecuta el Atajo):** **automático** (Health Auto Export programado
  por intervalo) + **botón "Sincronizar" = deep link directo** `shortcuts://run-shortcut?name=...`
  para forzar desde el móvil. **Descartado** (por ahora) el plan de **push (Telegram/Pushover) +
  deep link**: añade dependencia externa y solo aporta si se dispara desde el escritorio; el caso
  real es móvil (CLAUDE.md §1). Queda en reserva si más adelante se necesita disparar desde el PC.
- **Pendiente:** botón deep link en la UI (Perfil/Hoy), endpoint autenticado para que el usuario
  genere/rote su `syncToken` desde la web, y el modelo + persistencia de la biometría.

---

### 2026-06-30 · Modelo de datos biométricos + inventario REAL del anillo

- **Inventario REAL del anillo** (KSIX Ring vía Apple Health), confirmado capturando el payload de
  HAE v2 en producción: el anillo SOLO exporta **4 métricas**: `sleep_analysis` (fases
  total/deep/rem/core/awake + tiempos), `heart_rate` (Min/Max/Avg diario), `step_count` (qty) y
  `active_energy` (qty, en **kJ**). **NO exporta** HRV, SpO2, FC en reposo, frecuencia respiratoria,
  temperatura ni peso — la app del anillo los recoge pero no los vuelca a Salud (limitación dura).
- **Readiness sin HRV automático:** se construirá con **sueño + desviación de FC en reposo** (proxy:
  `heart_rate.Min`) **+ carga** (pasos/energía). HRV/SpO2/peso entran por **ENTRADA MANUAL** desde la
  web (el usuario los ve en la app del anillo). Honesto: no es un clon de Whoop, pero es un readiness
  defendible. El registro de ENTRENO (series/reps/carga/RPE) es otro bloque aparte, no biométrico.
- **Modelo de datos = documento diario por usuario** (`DailyMetrics`): 1 doc por `(userId, date)`,
  **índice único compuesto**, **upsert idempotente**. `date` como string `"YYYY-MM-DD"` (substring
  del `date` de HAE; evita líos de zona horaria). Métricas normalizadas en `metrics{}` con `source`
  por métrica; `readiness` cacheado en el mismo doc (alinea con la caché diaria, §4). **Descartada**
  la colección de muestras normalizada (1 doc/métrica): más queries para la vista diaria y cacheo
  menos directo. El **upsert mergea con `$set` dinámico** solo de las métricas presentes → el sync
  **nunca pisa** los campos manuales (HRV/SpO2/peso) ni el readiness del mismo día.
- **Formato HAE v2:** mezcla mayúsculas (`Min/Max/Avg` vs `qty`); energía en kJ → se guarda en
  **kcal** (÷4.184). Normalizador defensivo: ignora métricas desconocidas y puntos sin fecha.
- **Pendiente:** cálculo del Readiness; entrada manual (endpoint + UI Perfil) de HRV/SpO2/peso; vista
  Hoy/Tendencias contra datos reales; tests (mongodb-memory-server ya instalado).
- **Dev local en el VPS (2026-06-30):** se desarrolla con `npm run dev` en el propio VPS y acceso por
  **túnel SSH** (`ssh -L 5173:localhost:5173 -L 4000:localhost:4000`). Ventaja: no se toca firewall ni
  CORS ni se exponen puertos al exterior; `localhost` vale tal cual. El Mongo del compose se expone
  **solo a loopback** (`127.0.0.1:27017:27017`) para que el dev del host lo alcance sin abrirlo a
  internet. Dev usa **la misma BD que producción** (decisión provisional del usuario: "por el momento
  me da igual"). **Pendiente/riesgo:** dev escribe sobre datos reales; cuando moleste, separar a una BD
  `smartpeak_dev`. La contraseña de Mongo apareció parcialmente en un transcript local (credencial
  propia, no expuesta a terceros); rotarla si se quiere ser estricto.

---

### 2026-06-30 · «Hoy» contra datos reales: `GET /metrics/latest`, estados de widget y alcance «solo datos reales»

- **Decisión:** la pestaña Hoy deja de usar el mock `data.ts` y se alimenta de
  `GET /api/metrics/latest` (devuelve el `DailyMetrics` más reciente; 200 con `null` si no hay
  datos, no 404). Se muestran como **reales** solo las 4 métricas que llegan del sync del anillo
  (Sueño · FC reposo [proxy `heartRate.min`] · Pasos · Energía activa). HRV/SpO2/Peso (entrada
  manual aún no implementada) y Readiness/Coach/Tendencia (cálculo/IA pendientes) se muestran en
  estado **«Próximamente»** (DESIGN.md §11b), nunca con cifras inventadas.
- **Motivo:** honestidad del producto. Un Readiness sin baseline de varios días o un coach sin el
  modelo de IA elegido serían ruido y contradirían el valor (autorregulación = desviación contra el
  histórico). Mejor enseñar lo que de verdad tenemos y marcar el resto como pendiente.
- **Sub-decisiones:** (1) **deltas ↑/↓ omitidos** mientras no haya histórico (no se inventan); (2)
  **metas/ringPct provisionales** (pasos 10k, sueño 8h, energía 500 kcal, FC reposo heurística
  `(80-min)/40`) anotadas en código, a sustituir por objetivos del perfil/rol; (3) token
  **`--m-energy`** (coral) nuevo para energía activa, provisional como el resto de `--m-*`; (4) el
  botón «Sincronizar» dispara el **deep link** del Atajo de iOS llamado `SmartPeak` y el hook
  re-fetchea al volver a la app (`visibilitychange`/`focus`), sin necesidad de callback.
- **Alternativas descartadas:** calcular un Readiness básico ya (descartado por el usuario: alcance
  «solo datos reales»); endpoint `/today` por fecha exacta (descartado: el Atajo exporta el día
  anterior, así que «el más reciente» es lo correcto); mantener el mock (mostraría datos falsos).

---

### 2026-06-30 · Ingesta horaria (intradía): series por hora + agregados derivados

- **Decisión:** el normalizador del sync (`syncBiometrics.ts`) pasa de "1 punto por día (el
  último gana)" a **acumular por (día, hora)**. Cuando HAE exporta con *Time Grouping = Hour*,
  se guardan **series por hora** además del agregado diario:
  - `metrics.heartRate.samples: [{ t, min, avg, max }]`
  - `metrics.steps.hourly: [{ t, qty }]`
  - `metrics.activeEnergy.hourly: [{ t, kcal }]`
  - `t` = **hora local** `"HH:00"` (de `date.slice(11,13)`, sin convertir a UTC). Series
    ordenadas asc. por `t`, sub-schemas `{_id:false}`, `default:undefined` (sin `[]` espurios).
  - **Agregado diario derivado** (para `Hoy`/Readiness, sin recalcular la serie): pasos=suma,
    energía=suma kcal, FC=`{min:mín de mins, max:máx de maxs, avg:media de avgs}`. Sueño sigue
    **1/día** (es nocturno, no horario).
- **Motivo:** el usuario quiere desglose horario para **gráficas** (Tendencias) y para derivar
  la **FC en reposo nocturna real** (mín durante el sueño), no la media diaria. HAE ya entrega la
  hora en `date`; antes la tirábamos.
- **Matiz de redondeo (avalado):** el **total diario = suma de los tramos YA redondeados**, no el
  redondeo de la suma cruda. Así la suma de la serie visible **cuadra** con el total mostrado, sin
  descuadres de ±1 en las gráficas. **Excepción** (hallazgo del revisor): si un punto llega **sin
  hora válida**, cuenta en el total pero **no** en la serie → la UI de Tendencias/Hoy **no debe
  asumir** `Σserie == total` en ese caso. Con el export horario de HAE no ocurre (todos traen hora).
- **Idempotencia:** upsert por `{userId,date}` con `$set` del **objeto completo** de cada métrica
  presente (reemplaza la serie, **no** `$push`) → reenviar "hoy" varias veces **actualiza** sin
  duplicar. **Retrocompatible** con el formato diario legacy (Atajo "Export Health Data").
- **Verificación:** 9/9 tests (`mongodb-memory-server`, runner nativo de Node `node --import tsx
  --test`) + 7 tests de borde del revisor. **Revisor: APROBADO, apto para desplegar.**
- **Alternativas descartadas:** guardar solo el agregado diario (pierde la serie para gráficas);
  escribir el histórico directo en Mongo (se hará **reenviando el JSON al endpoint**, que valida y
  normaliza igual que el Atajo).
- **Menores pendientes (no bloquean):** test de energía semi-tautológico (añadir valor a mano);
  normalizar el `source` compuesto (`"KSIX Ring|iPhone…"`) si en el futuro se muestra la fuente.

---

### 2026-06-30 · Motor de cálculo de scores deterministas (sin IA)

- **Decisión (del usuario):** implementar por **código** (cero tokens) todos los scores
  derivados de la biometría: **Calidad de sueño**, **Preparación/Recuperación**, **Esfuerzo
  del día (strain)**, **Nivel de energía** y **Estrés**. Esto **revierte** el alcance previo
  "solo datos reales" (2026-06-30) que pospuso el readiness: ahora se calcula, pero con
  **manejo explícito de cold-start** (ver abajo). Refuerza CLAUDE.md §4: lo numérico NO lo
  toca la IA; la IA queda reservada al texto del coach (fase posterior).
- **Por qué código y no IA:** ningún producto serio (Whoop/Oura/Garmin/HRV4Training) calcula
  recuperación con un LLM; usan estadística sobre la **línea base personal**. Un LLM ahí sería
  caro, no determinista, no auditable y MENOS fiable que una fórmula calibrada.
- **Datos disponibles (anillo KSIX vía Apple Health):** sueño (total/deep/rem/core/awake en
  **horas decimales**), FC (min/max/avg + serie horaria), pasos, energía activa (kcal). **Sin
  HRV/SpO2/peso automáticos** (entrada manual futura). **FC reposo = proxy `heartRate.min`**.
- **Fórmulas y pesos fijados** (ajustables; defaults de dominio):
  - **Calidad de sueño** (0–100): duración vs 7,5–9 h **0,40** · reparador (deep 13–23% + REM
    20–25%) **0,30** · eficiencia dormido/en-cama **0,20** · continuidad (penaliza awake)
    **0,10**. Estados: ≥85 excelente · 70–84 bueno · 50–69 regular · <50 malo.
  - **Preparación/Recuperación** (0–100): sueño anoche **0,35** · FC reposo vs baseline (z-score)
    **0,30** · HRV vs baseline **0,20** (solo si hay dato manual; si no, se **redistribuye**) ·
    carga aguda/crónica (ACWR-like) **0,15**. Pesos **renormalizados** por disponibilidad.
    Estados: ≥75 recovered · 50–74 moderate · <50 fatigue (encaja con el anillo por estado).
  - **Esfuerzo/Strain** (0–100): energía activa vs media **0,45** · carga cardíaca por tiempo en
    zonas de FC (zonas desde FCmax **208 − 0,7·edad**, Tanaka, sobre la serie horaria) **0,40** ·
    pasos vs media **0,15**.
  - **Nivel de energía** (Body Battery simplificado): `≈ 0,6·recuperación + 0,4·(100 − strain)`.
  - **Estrés** (0–100): proxy de carga autonómica `FC media/FC basal` **0,5** · deuda de sueño
    (100 − sleepScore) **0,3** · elevación de FC reposo (z) **0,2**.
- **Cold-start (regla):** los z-scores (FC reposo, carga) exigen ~7–14 días de histórico. Con
  `n < 7` la Recuperación se apoya casi solo en el sueño y se marca **`confidence: "low"`**;
  nunca se muestra un número con falsa precisión. `medium` 7–13 d · `high` ≥14 d.
- **Estrés = métrica débil (asterisco honesto):** sin HRV continuo no es un estrés clínico
  (Garmin/Whoop usan HRV de muñeca todo el día). Se entrega como **estimación** (`confidence:
  "proxy"`), con menor prominencia visual, hasta que entre el HRV manual.
- **Arquitectura:** funciones **puras y testeables** en `server/src/services/scores/` (una por
  métrica + helper de baseline + orquestador `computeDailyScores(today, history, user)`),
  alimentadas por una query de histórico (N días) que **aún no existe**. Se invocan en lectura
  (`GET /api/metrics/latest`) y se **cachean** en `readiness` del doc diario (`strict:false`,
  **sin migración**). El DTO está **duplicado a mano** en `client/src/features/today/types.ts`:
  al ampliar el contrato hay que tocar ambos lados.
- **Alternativas descartadas:** calcular readiness con IA (caro/no determinista); esperar al HRV
  manual para arrancar (el usuario quiere los scores ya); persistir scores en colección aparte
  (el doc diario ya es la unidad de caché, §4).

---

### 2026-06-30 · Desglose intradía: vista de detalle a pantalla completa + sueño por fases

- **Decisión (2 dilemas consultados al usuario):**
  1. **Apertura del desglose = vista a pantalla completa** (push estilo Apple Salud) en su **propia
     ruta** (`/metrica/:metricKey`) **anidada bajo `AppLayout`** → la regleta/tab bar persisten y la
     URL es real (el atrás del navegador cierra). Descartado: **bottom-sheet/modal** (más ligero
     pero menos inmersivo y sin URL propia).
  2. **Sueño = desglose por FASES** (profundo/REM/ligero/despierto + inicio→fin), **no por horas**:
     Apple exporta el sueño 1/día, no hay serie horaria. Descartado: dejar la card de sueño **no
     clickable** (rompería la coherencia de que las 4 cards reales abren desglose).
- **Motivo:** el uso es mayoritariamente móvil y el patrón de detalle de Apple Salud (push con back
  + tab bar visible) es el más reconocible; la URL propia da navegabilidad y compartibilidad. El
  sueño merece desglose aunque sea por fases (es señal valiosa para el rol powerlifting/salud).
- **Implementación:** solo las cards en estado `data` son interactivas (se renderizan como `<a>` vía
  `Widget to?`); `empty`/`soon` no navegan. Gráficas **SVG hechas a mano** (sin librería, como
  `TrendWidget`), color solo en el dato (`--m-*`), cifras/ejes en mono. DESIGN.md **§12** fija el
  patrón (cards clickables, tipos de gráfica, estados, motion + `prefers-reduced-motion`).
- **Sin backend:** `GET /api/metrics/latest` ya devolvía el documento completo con las series; el
  DTO del front (`types.ts`) se amplió para tiparlas (sigue **duplicado a mano** respecto al back).
- **Tooltip interactivo de las gráficas (§12b):** el valor de cada hora/fase se muestra **bajo
  demanda** — **hover** en puntero fino, **tap** en táctil. Se distingue el gesto por `pointerType`
  **y** se gatea el hover-follow con `matchMedia('(hover: hover) and (pointer: fine)')` (regla dura
  §11). Es **mejora progresiva**: el dato ya vive en el DOM (cifra-héroe + `DetailStats` +
  `aria-label`), el tooltip va `aria-hidden`. Descartado rotular todos los valores (satura).
- **Scrub táctil SIN captura de puntero (decisión técnica clave):** en móvil se arrastra el dedo
  para recorrer la gráfica. Se **descartó `setPointerCapture`** (la primera implementación lo usaba):
  capturar el puntero en el `pointerdown` **anula `touch-action: pan-y` y secuestra el scroll
  vertical** de la página si el gesto empieza sobre la gráfica. En su lugar **no se captura**: el
  navegador arbitra — arrastre **vertical** = scroll de página (dispara `pointercancel`, que oculta
  el tooltip) · arrastre **horizontal** = scrub (los `pointermove` llegan al elemento, de ancho
  completo). Además **mata la selección de texto/lupa de iOS** (`user-select:none` +
  `-webkit-touch-callout:none`, clase `.sp-chart-scrub`). La mecánica vive en un hook genérico
  compartido `usePointerScrub(pickIndex, count)` (lo usan el scrubber de horas y el de fases del
  sueño) → sin duplicación. Coste asumido: si el dedo abandona la gráfica verticalmente en mitad de
  un scrub horizontal, el seguimiento se pausa (sin captura) — irrelevante en la práctica.
- **Pendiente:** validación visual/táctil en navegador/móvil real con datos horarios (375px + desktop).

---

### 2026-06-30 · PWA instalable («Añadir a pantalla de inicio») con enfoque MANUAL

- **Decisión:** convertir la web en **PWA instalable** (Android e iOS) **sin `vite-plugin-pwa`**:
  manifest propio + metas en `index.html` + service worker escrito a mano. **Motivo:** minimalismo
  del proyecto, **cero magia de build** y control total; no se necesita el precache de Workbox ni
  su tamaño. **Alternativas descartadas:** `vite-plugin-pwa`/Workbox (genera SW y precache que no
  queremos mantener); no hacer PWA (se pierde el "Añadir a pantalla de inicio" pedido).
- **Service worker MÍNIMO, NO offline-first:** `client/public/sw.js` solo habilita
  **instalabilidad + carga rápida del shell + auto-update**. Estrategia: **network-first** en
  navegación, **cache-first** en `/assets`; **ignora `/api` y terceros**; `skipWaiting` +
  `clients.claim`. Registrado **solo en producción** desde `main.tsx`. **Motivo:** la app depende
  del backend; un offline real sería **humo**. **No** añade llamadas a IA → **cumple la regla 4 de
  CLAUDE.md**.
- **`apple-mobile-web-app-status-bar-style = black`** (NO `black-translucent`): el layout solo
  respeta `safe-area-inset-bottom` (TabBar), **no** el top; con `translucent` el header se
  solaparía con la barra de estado. **Reconsiderar `black-translucent`** (look inmersivo) si más
  adelante se añade `safe-area-inset-top` al header.
- **Captura de `beforeinstallprompt` a nivel de APP (store de módulo):** se registra en
  `installStore.ts`, importado al arranque desde `main.tsx`, **NO** en el `useEffect` del
  componente (que vive en Perfil y se monta tarde → **perdería el evento**, que Chrome dispara una
  sola vez al cargar). El hook `useInstallPrompt` lee el store con `useSyncExternalStore`. **Este
  bug lo detectó el revisor** y se corrigió antes de cerrar.
- **Iconos:** **iOS** usa `apple-touch-icon.png` (180px, ya existía); **Android** usa el manifest
  con `any` (PNG existentes) + **`maskable`** full-bleed (`brand/icon-maskable-{192,512}.png`)
  **generados a mano** (script Node/zlib sobre fondo `#0E0F12`) por falta de tooling de imagen
  (no había ImageMagick ni sharp). Manifest: `name`/`short_name` SmartPeak, `display: standalone`,
  `bg`/`theme` `#0E0F12`.
- **Nginx (`client/nginx.conf`):** bloques `location =` para `/sw.js` (**`no-store`**, que el SW se
  actualice siempre) y `/manifest.webmanifest` (**`no-cache`** + `default_type
  application/manifest+json`).
- **UI (affordance en Perfil):** sección **«Instalación»** monocroma en `ProfilePage.tsx` que
  **bifurca por plataforma** — Android/Chrome → botón que dispara el **prompt nativo**; iOS Safari
  → **guía en `<details>`** (Compartir → Añadir a pantalla de inicio). Código en
  `client/src/features/pwa/` (`installStore.ts` + `useInstallPrompt.ts` + `InstallApp.tsx`) +
  iconos `DownloadIcon`/`ShareIcon`. **Patrón documentado en DESIGN.md §13.**

---

### 2026-06-30 · Estrés vía HRV manual (no se teclea el estrés del anillo) + presentación de scores en Hoy

- **Contexto:** la app del anillo (KSIX) calcula estrés y HRV con HRV continuo pero **no los exporta
  a Apple Health**. El usuario dudaba entre teclear el estrés ya calculado o teclear la HRV y derivar
  el estrés en el backend.
- **Decisión:** se prioriza la **entrada manual de HRV** (lectura matutina), **no** el estrés.
  Motivo: la HRV es un dato de **entrada** que alimenta varias salidas (completa el componente HRV del
  Readiness, habilita el estrés derivado y da una tendencia de HRV útil); el estrés del anillo es un
  número de **salida** opaco (escala propietaria de KSIX) que no alimenta nada más. Más información por
  teclazo.
- **Estrés derivado:** se calculará desde la HRV vs baseline (HRV baja → estrés alto). **Matiz honesto:**
  será un *"estrés autonómico en reposo"* (foto matutina), **no** el estrés continuo de la pulsera. El
  proxy de FC del motor (`computeStress`) queda como fallback degradado y **no se muestra por defecto**.
- **Alcance de esta tanda:** se cablean en Hoy los **4 scores sólidos** con datos del anillo
  (Preparación · Calidad de sueño · Nivel de energía · Esfuerzo). El **Estrés** queda *"Próximamente
  (requiere HRV)"*. **Siguiente bloque:** entrada manual de HRV → activa el estrés y completa el Readiness.
  Orden acordado: **validación visual del usuario** de los 4 scores antes de montar la entrada de HRV.
- **Presentación (aprobada por el usuario):** Preparación = hero, anillo **por estado** (pos/warn/neg) +
  **badge de confianza** en cold-start. Calidad de sueño / Energía / Esfuerzo = cards con **color de
  métrica propio** y el **estado en el caption** (texto), **no** semáforo — porque el **esfuerzo es
  neutro** (un día de mucha carga no es "malo/rojo"); solo Preparación y el futuro Estrés tienen valencia.
  Sueño: el anillo pasa a **calidad %**, las horas a sub-dato. Detalle visual en **DESIGN.md §14**.
- **Alternativas descartadas:** teclear el estrés del anillo (opaco, no reutilizable); mostrar el estrés
  con el proxy de FC ya (flojo, el usuario tiene acceso a la HRV); pintar el esfuerzo por semáforo
  (implicaría una valencia buena/mala que el esfuerzo no tiene).

---

### 2026-06-30 · Skills de diseño: del global del Mac al REPO; `impeccable` descartada

- **Contexto / corrección:** la decisión 2026-06-27 instaló las 4 skills en **`~/.claude/skills/`**
  (home **global del Mac**), no en el repo. Al clonar el proyecto al VPS, ese directorio no existe
  → en `/home/kuoyii/servers/smartpeak` **no había ninguna skill** (solo el `README.md` de
  `.claude/skills/`). Las copias originales viven en otros proyectos del usuario
  (`total-grind/.agents/skills/`).
- **Decisión:** las skills de diseño **viven DENTRO del repo** en **`.claude/skills/`**
  (commiteables, viajan con el proyecto y las carga el harness de Claude Code como `/skill`).
  Corrige la ubicación de la decisión 2026-06-27 (deroga `~/.claude/skills/` global).
- **Alcance = 3 skills (no 4):**
  - `design-taste-frontend` ← repo `Leonxlnx/taste-skill`
  - `emil-design-eng` ← repo `emilkowalski/skills`
  - `review-animations` ← repo `emilkowalski/skills`
- **`impeccable` DESCARTADA (motivo):** no es una skill de *prompt* sino un **sistema** con
  instalador propio (`npx impeccable install`) que planta ~50 scripts `.mjs` en
  `.agents/skills/impeccable/` + 23 comandos slash. Solapa con **DESIGN.md**, que ya es el sistema
  de diseño **autoritativo** del proyecto; su valor (imponer un sistema donde no lo hay) no aplica
  aquí. Lo que ya se absorbió de sus IDEAS sigue integrado en DESIGN.md (§8 motion, §11 interacción,
  veto del *hero-metric*) — eso no se revierte; solo se deja de instalar la herramienta.
- **Cómo se instalan ahora:** vía CLI `npx skills add <repo> -a claude-code --copy` (formato Claude
  Code: carpeta + `SKILL.md` con frontmatter). `design-taste-frontend` y `emil-design-eng` se
  **copiaron desde la copia local** de `total-grind` (sin red, son `SKILL.md` puros sin scripts).
- **Bloqueo del harness (importante):** el **auto-mode classifier** veta tanto **descargar** skills
  de repos que el agente descubrió por web (*Untrusted Code Integration*) como **auto-otorgarse** el
  permiso para hacerlo (*Self-Modification*). Solo el **usuario** lo destraba: corriendo el `npx`
  él mismo, añadiendo una regla `Bash(npx skills add:*)` en `.claude/settings.local.json`, o fuera
  de auto-mode.
- **Estado:** 2/3 instaladas (`design-taste-frontend`, `emil-design-eng`); **`review-animations`
  pendiente de descarga** por el usuario (`npx -y skills add emilkowalski/skills --skill
  review-animations -a claude-code --copy -y`).
- **Pendiente doc:** CLAUDE.md §5 ya actualizado (3 skills); revisar si limpiar las menciones a
  `impeccable` en DESIGN.md §0/§8/§11 (hoy son atribuciones conceptuales válidas → de momento se
  conservan).

---

### 2026-06-30 · El peso entra por SYNC (Apple Health) además de manual; precedencia «manual gana»

- **Contexto / bug:** el usuario reportó que el peso no llegaba a la app pese a estar en Apple
  Health. Diagnóstico: el Atajo **sí exporta** `weight_body_mass` (confirmado con payload real de
  producción: `units: "kg"`, `source: "Salud"`, ~1 lectura los días que se pesa), pero el
  normalizador del sync (`syncBiometrics.ts`) lo **descartaba en el `default`** del `switch` (solo
  contemplaba 4 métricas: `step_count`/`active_energy`/`heart_rate`/`sleep_analysis`).
- **Clasificación previa errónea (corregida):** el peso se había metido en el saco «entrada
  manual» junto a HRV/SpO2 (ver inventario del anillo, `dispositivo.md`). Pero **no es el mismo
  caso**: HRV/SpO2 el anillo KSIX **no los vuelca a Salud** (por eso van por captura+IA); el peso
  **sí está en Apple Health** (báscula/entrada manual del iPhone, `source:"Salud"`) → es
  perfectamente **sincronizable**. Un anillo no pesa: el peso nunca dependió del anillo.
- **Decisión (del usuario):** el peso entra por **dos vías que coexisten**: ① **sync** (Apple
  Health vía Atajo) y ② **entrada manual** desde la app (futura, otra tanda).
- **Precedencia «manual gana»:** el sync **NO pisa** un `metrics.weight` cuyo `source` sea
  `'manual'`. Convención de `source`: el **sync** guarda el string crudo de HAE (`"Salud"`,
  `"KSIX Ring"`); la entrada **manual** escribirá el literal **`'manual'`** como discriminador.
  Motivo: si el usuario se molesta en teclear/corregir su peso, el Atajo no debe machacarlo.
- **Implementación (esta tanda, SOLO backend):** nuevo `case 'weight_body_mass'` — escalar **por
  día** (no horario ni aditivo, a diferencia de pasos/energía), **kg sin conversión** (≠ energía
  kJ→kcal), «última lectura del día gana». Persistencia **fuera** del `$set` masivo, con **doble
  `updateOne`**: (1) update condicional `{'metrics.weight.source': {$ne:'manual'}}` sin upsert; (2)
  si `matchedCount===0`, upsert con `$setOnInsert` que **solo inserta si el día no existe** (evita
  insertar un duplicado que chocaría con el índice único `userId+date` cuando hay peso manual).
  Idempotente y retrocompatible con el formato diario legacy.
- **Verificación:** ejecutor 41/41 tests + revisor APROBADO con **11 tests adversariales propios**
  (los 4 escenarios de precedencia, idempotencia N=3, día solo-peso, peso+otras métricas, legacy
  sin hora). typecheck limpio. **APTO para staging.**
- **Limitación conocida (hallazgo revisor, severidad baja):** el desempate «última lectura del
  día» usa **comparación lexicográfica del string de fecha crudo**; si dos pesos del mismo día
  calendario llegaran con **offsets de TZ distintos**, el orden podría no ser el temporal real. No
  aplica al uso esperado (lecturas del mismo dispositivo/usuario comparten TZ). Fix si algún día
  importa: comparar `Date.parse(raw)` (epoch) en vez del string.
- **Menor abierto (no bloqueante):** `metricsByDay` reporta `weight` en el resumen del response
  aunque ese día **no se escribiera** por haber peso manual (no-op). Impacto nulo hoy (el resumen
  no es crítico); anotado por si se afina.
- **Pendiente:** vía ② (endpoint + UI de **entrada manual de peso** en la app) — la lógica de
  precedencia ya queda montada; basta con que escriba `source:'manual'`. Mostrar el peso en `Hoy`
  (hoy la card de Peso está «Próximamente») va con esa tanda.
- **Alternativas descartadas:** mantener el peso como **solo-manual** (contradice que ya está en
  Salud y añade fricción inútil); que el sync **pise siempre** (rompería un valor manual corregido).

---

## Pendientes de decidir (aún abiertas)

- Modelo de IA concreto.
- Enfoques de cada rol (Powerlifting / Hipertrofia / Salud General).
- **Monocromo total** (datos incluidos, 100% como la landing): alternativa abierta a "color solo
  en datos" (decisión 2026-06-29).
