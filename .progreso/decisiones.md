# Decisiones — ¿por qué se hizo así?

> ADR ligero. Una entrada por decisión relevante. Formato: fecha · decisión · motivo · alternativas descartadas.

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

## Pendientes de decidir (aún abiertas)

- Modelo de IA concreto.
- Enfoques de cada rol (Powerlifting / Hipertrofia / Salud General).
- **Monocromo total** (datos incluidos, 100% como la landing): alternativa abierta a "color solo
  en datos" (decisión 2026-06-29).
