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

## Pendientes de decidir (aún abiertas)

- Modelo de IA concreto.
- Enfoques de cada rol (Powerlifting / Hipertrofia / Salud General).
- Colores por métrica `--m-*` (provisionales en DESIGN.md §3b).
