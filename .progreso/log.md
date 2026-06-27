# Log — historial de todo

> Entradas cronológicas (más reciente arriba). Anota qué se hizo en cada sesión.

---

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
