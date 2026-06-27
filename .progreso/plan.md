# Plan — tareas y fases

> Lista viva. Marca `[x]` lo hecho. El detalle del orden de UI está en [CLAUDE.md](../CLAUDE.md) §6.

## Fase 0 — Scaffolding (infraestructura)

- [ ] Decidir estructura del monorepo / carpetas (`client/` + `server/` o similar)
- [ ] Scaffolding del backend Node + Express
- [ ] Scaffolding del frontend React (+ Tailwind)
- [ ] Conexión a MongoDB
- [ ] Endpoint de ingesta del POST del Atajo de iOS (Health Auto Export)
- [ ] Variables de entorno y `scripts/init.sh` con comandos reales

## Fase 1 — Bloquear el sistema de diseño

- [ ] Tokens CSS (DESIGN.md §2–4) + config de Tailwind
- [ ] Cargar fuente mono (UI = fuente del sistema)
- [ ] Pestaña `Hoy`: dashboard de widgets + Readiness + coach (base: mockup-mono.html)
- [ ] Shell: rail desktop + tab bar móvil con pestaña activa
- [ ] Iterar SOLO sobre `Hoy` hasta que el tono sea correcto

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
