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
- [x] Cargar fuente mono (UI = fuente del sistema)
- [x] Pestaña `Hoy`: dashboard de widgets + Readiness + coach (base: mockup-mono.html) — modo VISTA
- [x] Shell: rail desktop + tab bar móvil con pestaña activa
- [ ] **Modo edición** del dashboard (jiggle/drag/resize/añadir-quitar + persistencia layout) — Iteración B
- [ ] Iterar SOLO sobre `Hoy` hasta que el tono sea correcto (validar render real en navegador)

## Fase 2 — Resto de pestañas (contra el sistema bloqueado)

- [ ] `Tendencias` (históricos HRV / sueño / peso)
- [ ] `Entreno` (autorregulación por rol)
- [ ] `Perfil` (rol, tema, sincronización)

## Fase 3 — IA

- [ ] Decidir modelo de IA
- [ ] Preprocesado de medias en JS (antes de llamar al modelo)
- [ ] Respuesta JSON estructurada y corta
- [ ] Caché del análisis del día en MongoDB
- [ ] Definir enfoques por rol (Powerlifting / Hipertrofia / Salud General)
