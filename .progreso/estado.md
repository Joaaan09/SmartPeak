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

## En curso

- Nada a medias. El bloque de auth está cerrado a falta de la prueba e2e con una BD real.

## Siguiente paso

1. **Levantar un MongoDB** (Atlas o local) y hacer el smoke real del flujo: registro 5 pasos →
   sesión → `/` → logout → login. Confirmar `toJSON` no expone `passwordHash` con doc real.
2. Empezar **Fase 1 de UI de producto**: pestaña `Hoy` (dashboard de widgets + Readiness +
   coach) sobre el shell (rail desktop + tab bar móvil). Base: `mockup-mono.html`.

## Bloqueos / pendientes de decisión

- Modelo de IA por decidir · enfoques por rol · colores `--m-*` (provisionales).
- Mejora opcional pendiente (no bloqueante): single-flight del refresh ya hecho; falta suite de
  tests automatizados y rate-limiting en login (anotado para más adelante).

## Git / ramas (regla dura nueva en CLAUDE.md §9)

- Desarrollo en `staging` (o ramas de feature → `staging`). `main` solo para validado.
- Trabajo de esta sesión en rama **`feat/scaffold-auth`** (aún SIN commitear; pendiente de
  decidir commit a `staging`). `main`/`staging`/`feat/scaffold-auth` en el baseline `b9851a5`.
