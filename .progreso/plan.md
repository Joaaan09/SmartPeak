# Plan — tareas y fases

> Lista viva. Marca `[x]` lo hecho. El detalle del orden de UI está en [CLAUDE.md](../CLAUDE.md) §6.

## Fase 0 — Scaffolding (infraestructura)

- [x] Decidir estructura del monorepo / carpetas (`client/` + `server/`) + raíz con `concurrently`
- [x] Scaffolding del backend Node + Express (TypeScript, ESM)
- [x] Scaffolding del frontend React (+ Tailwind v3) — TypeScript
- [x] Conexión a MongoDB (`connectDB` con Mongoose; no rompe el server si Mongo no responde)
- [ ] Endpoint de ingesta del POST del Atajo de iOS (Health Auto Export)
- [x] Variables de entorno (`.env.example` en server y client) y comandos reales en CLAUDE.md §10

## Fase 0.5 — Autenticación (entrada de la app) — añadida

- [x] Modelo `User` (rol Power/Hiper/Salud + sexo + físicos + `preferences.theme`)
- [x] Backend auth JWT: register / login / refresh / logout / me + `PATCH /users/me` (rol editable)
- [x] Login UI + wizard de registro premium de 5 pasos (mobile-first, DESIGN.md)
- [x] AuthContext (token en memoria + rehidratación) + rutas protegidas
- [x] Revisión adversarial + corrección de hallazgos (typecheck/build/lint verdes)
- [ ] Smoke test end-to-end contra un MongoDB real (Atlas/local) — PENDIENTE

## Fase 1 — Bloquear el sistema de diseño

- [x] Tokens CSS (DESIGN.md §2–4) + config de Tailwind
- [x] Cargar fuentes de marca (Space Grotesk UI + Space Mono datos/eyebrows) — alineado con la landing
- [x] **Realinear el sistema con la landing** (2026-06-29): paleta tinta/papel, tipografía,
  readiness en barra lineal, coach monocromo, pico de marca. Docs + mockup actualizados.
- [x] Pestaña `Hoy`: dashboard de widgets + Readiness + coach (base: mockup-mono.html) — modo VISTA
- [x] Shell: rail desktop + tab bar móvil con pestaña activa
- [x] **PWA instalable** («Añadir a pantalla de inicio», Android + iOS): manifest + metas iOS + SW
  mínimo (no offline-first) + affordance «Instalar app» en Perfil (Android prompt nativo / iOS guía
  Compartir→Añadir). Enfoque manual, sin `vite-plugin-pwa`. DESIGN.md §13 (2026-06-30, revisor
  APROBADO; **falta** prueba real en dispositivos + Lighthouse «Installable»)
- [x] **Desglose intradía**: cards de `Hoy` clickables → vista de detalle `/metrica/:key` (barras por
  hora pasos/energía · banda mín–máx + media FC · fases de sueño). DESIGN.md §12 (2026-06-30,
  revisor APTO; **falta OK visual** con datos horarios reales)
- [x] **Scores deterministas (sueño/readiness/esfuerzo/energía/estrés) + UI en Hoy** — HECHO
  (2026-06-30). Motor puro en `server/src/services/scores/` (baseline personal z-score, renormalización
  de pesos, cold-start `confidence`) + 28 tests; integrados al vuelo en `GET /metrics/latest` (sin
  persistir); Hoy muestra Readiness real, sueño=calidad %, energía/esfuerzo y estrés «Próximamente».
  DESIGN.md §14 + 2 tokens (`--m-energylvl`, `--m-strain`). Revisado (motor/integración/UI) y validado
  por el usuario.
- [ ] **Bloque de entrada manual de HRV (3 vías: teclado / foto / Atajo de iOS) + estrés derivado** —
  activa el estrés-proxy real y completa el componente HRV del Readiness. Ver
  [dispositivo.md](dispositivo.md) (ingesta por captura + IA de lo no exportado por el anillo).
- [ ] **OK visual del usuario** del realineado (375px + desktop, ambos temas) y commit
- [ ] **Modo edición** del dashboard (jiggle/drag/resize/añadir-quitar + persistencia layout) — Iteración B
- [ ] Iterar SOLO sobre `Hoy` hasta que el tono sea correcto (validar render real en navegador)

## Fase 2 — Resto de pestañas (contra el sistema bloqueado)

- [ ] `Tendencias` (históricos HRV / sueño / peso)
- [ ] `Entreno` (autorregulación por rol)
- [ ] `Perfil` (rol, tema, sincronización)

## Fase 3 — IA

- [ ] Decidir modelo de IA
- [x] Preprocesado de medias en JS (antes de llamar al modelo) — lo cubre el **motor de scores
  determinista** (baseline personal + z-scores + agregados, todo en JS). HECHO (2026-06-30)
- [ ] Respuesta JSON estructurada y corta
- [ ] Caché del análisis del día en MongoDB
- [ ] Definir enfoques por rol (Powerlifting / Hipertrofia / Salud General)
