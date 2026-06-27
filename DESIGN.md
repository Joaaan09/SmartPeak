# SmartPeak — Sistema de Diseño

> Documento de referencia para construir la UI. Es una **restricción dura**: cualquier
> pantalla nueva se construye DENTRO de este sistema, no se improvisa. Si algo no está
> aquí, se decide y se añade aquí primero, luego se implementa.
>
> Referencia viva: [mockup-mono.html](mockup-mono.html) es la implementación canónica de
> la pestaña `Hoy`. Si el doc y el mock divergen, gana lo que se decida y se actualizan ambos.

Tono base: **Apple-grade · premium · calmado**. SmartPeak se siente como una app nativa de
Apple (Salud / Fitness): superficies neutras y limpias, mucho aire pero con datos densos y
legibles, y **el color vive solo en los datos** (cada métrica tiene su color). Tiene IA
integrada y eso se nota en un detalle premium (no en ruido). Confiado, sobrio, no clínico-agresivo.

---

## 0. Restricciones negativas (el "nada de…")

Estas reglas existen para evitar el look genérico de IA. No las rompas sin actualizar este doc.

- ❌ **Nada de `shadcn/ui` con sus estilos por defecto.** Puedes usar Radix/headless como
  base de comportamiento (accesibilidad), pero el estilo lo pones tú con estos tokens.
- ❌ **Nada de un color de marca que domine la app.** No hay acento de marca. El chrome
  (botones, nav, ticks) es **monocromo**; el color aparece **solo en los datos** (§3).
- ❌ **Nada de gradientes decorativos.** El único gradiente permitido es el **gradiente IA**
  y solo en el componente de coach (§3/§7b).
- ❌ **Nada de rejilla de 3 columnas "icono + título + párrafo".**
- ❌ **Nada de cards iguales en rejilla simétrica.** Bento intencional con jerarquía (§5).
- ❌ **Nada de cifras con fuente proporcional.** Toda métrica usa la mono con `tabular-nums`.
- ❌ **Nada de sidebar clásico "icono Lucide + label" + top-bar con avatar a la derecha.** Ver §6.
- ❌ **Nada de sombras pesadas.** En oscuro se separa por borde; en claro se permite una
  sombra **suave tipo iOS** (§4). Nada de `shadow-xl` ni glows neón.
- ❌ **Nada de `transition: all`, `ease-in` en UI, ni `scale(0)` como origen** de animación (§8).
- ❌ **Nada de bounce/elastic** en motion funcional, ni `addEventListener('scroll')` para reveals
  (usa `IntersectionObserver` o scroll-driven CSS).
- ❌ **Nada de `outline:none`** sin un `:focus-visible` de reemplazo (§11).

### Vetos sobre las skills de diseño (qué NO adoptar de ellas)
Las skills instaladas (`emil-design-eng`, `review-animations`, `impeccable`,
`design-taste-frontend`) son **guía de craft, no autoridad**: ante conflicto **manda este doc**.
No adoptes de ellas:
- ❌ Subir los *dials* de variance / "toma un riesgo estético audaz" / asimetría artsy
  (taste-skill por defecto 8/6/4) → SmartPeak es **calmado**: variance baja, motion bajo.
- ❌ Fuentes display "con personalidad" / "la fuente del sistema es aburrida" → SmartPeak usa
  **fuente del sistema + mono para datos** a propósito (§2).
- ❌ El ban del *hero-metric* de `impeccable` → aquí **el dato es el héroe** (§1); mostramos
  **datos reales** del usuario, no cifras decorativas. Solo evitamos el cliché SaaS (número
  grande + gradiente + stats inventadas).
- ❌ La arquitectura de **landing/marketing** de taste-skill (heroes, marquees, scroll-hijack,
  logo walls, bento con fotos): fuera de alcance, esto es una **app de producto**.
- ❌ Deleite/celebraciones (confetti) en eventos frecuentes → reservado a hitos raros de verdad.

---

## 1. Principios

1. **El dato es el héroe.** La cifra grande, mono y tabular manda. El texto explica, no decora.
2. **Calma premium.** Superficies neutras, aire generoso, jerarquía clara. Ni recargado ni vacío.
3. **El color solo significa.** No hay color decorativo: cada color identifica una métrica
   (§3) o una señal (`--pos`/`--neg`/`--warn`). Quita el color de los datos y el chrome sigue
   siendo gris neutro — y la app sigue siendo SmartPeak por su tipografía, su rejilla de
   widgets y el anillo de Readiness.
4. **La IA, presente pero contenida.** El componente de coach es el único sitio con el
   gradiente IA. Comunica "esto es inteligente" sin teñir la app.
5. **Un movimiento bueno, no diez.** El micro-movimiento comunica cambio de dato (un número
   que cuenta, un anillo que se llena), no decora. Excepción: el *jiggle* del modo edición (§5).

---

## 2. Tipografía

Dos roles. La UI usa la **fuente del sistema** (look Apple nativo); los datos usan **mono**.

- **UI / display** (títulos, navegación, texto, labels): **fuente del sistema**.
  - Stack: `-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif`.
  - En Apple resuelve a **SF Pro** → es lo que da el tono nativo. Pesos 400 / 500 / 600 / 700.
- **Cifras / datos / código** (toda métrica, ejes, tablas): una **mono** con `tabular-nums`.
  - Recomendada: **Space Mono** (la del mock). Alternativas: JetBrains Mono, IBM Plex Mono.

Regla de oro: **cualquier número que sea un dato va en la mono con
`font-variant-numeric: tabular-nums`.** El resto (labels, copy, botones) va en la del sistema.

### Escala tipográfica (rem, base 16px)
```
--text-2xs:  0.6875rem (11px)  · labels, captions, ejes
--text-xs:   0.75rem   (12px)  · meta, unidades
--text-sm:   0.875rem  (14px)  · cuerpo secundario
--text-base: 0.9375rem (15px)  · cuerpo
--text-lg:   1.25rem   (20px)  · subtítulos
--text-xl:   1.75rem   (28px)  · métrica de widget
--text-2xl:  2.5rem    (40px)  · métrica destacada
--text-3xl:  3.75rem   (60px)  · la cifra-héroe (readiness)
```
Labels: `--text-2xs`/`--text-xs`, peso 600, `--text-muted`. Apple usa poco mayúsculas
gritadas: prefiere **Capitalización normal** salvo en la tira meta y labels técnicos.

---

## 3. Color — neutro + color solo en los datos

**No hay color de marca.** Las superficies son grises de sistema (estilo iOS) y el chrome es
monocromo. El color entra exclusivamente por: (a) el **color de cada métrica**, (b) las
**señales** semánticas y (c) el **gradiente IA**.

### Tokens semánticos (lo que consumen los componentes)
```css
:root {
  --bg / --surface / --surface-2      /* superficies neutras */
  --line / --line-strong              /* hairlines y divisores */
  --text / --text-muted / --text-faint
  --accent / --accent-text            /* énfasis de UI MONOCROMO (botón, tick). NO es marca */
  --pos / --neg / --warn              /* señales fijas: verde / rojo / ámbar */
  --m-rdy / --m-hrv / --m-rhr /       /* COLOR POR MÉTRICA — provisionales (§3b) */
  --m-sleep / --m-steps / --m-weight
  --ring-track                        /* pista del anillo sin rellenar */
  --ai-grad                           /* gradiente IA (rosa→morado→azul), solo coach */
  --hi / --shadow / --r / --r-sm      /* luz superior 1px · sombra · radios */
}
```
Reglas:
- `--accent` es **monocromo** (≈ blanco en oscuro, ≈ negro en claro). Pinta botón primario,
  cápsula de nav activa y foco. Nunca es un color saturado.
- `--pos`/`--neg`/`--warn` son **fijos** y significan lo mismo en todos los temas.
- Los `--m-*` solo se usan en su métrica (anillo + trazo de su gráfica). Ningún componente
  de chrome usa un `--m-*`.

### Temas (ambos a grado Apple)
```
Dark (default):
  --bg #000000  --surface #1C1C1E  --surface-2 #2C2C2E
  --line #38383A  --line-strong #48484A
  --text #F5F5F7  --text-muted #98989F  --text-faint #636366
  --accent #F5F5F7  --accent-text #1C1C1E
  --pos #30D158  --neg #FF453A  --warn #FFD60A
  --ring-track #2C2C2E   --hi rgba(255,255,255,.05)   --shadow none

Light ("Paper"):
  --bg #F2F2F7  --surface #FFFFFF  --surface-2 #FFFFFF
  --line #E5E5EA  --line-strong #D1D1D6
  --text #1D1D1F  --text-muted #8A8A8E  --text-faint #B0B0B5
  --accent #1D1D1F  --accent-text #FFFFFF
  --pos #34C759  --neg #FF3B30  --warn #FF9F0A
  --ring-track #E9E9EE   --hi transparent   --shadow 0 1px 2px rgba(0,0,0,.05), 0 8px 22px rgba(0,0,0,.05)
```
El usuario **solo** alterna claro/oscuro. No hay selector de acento (se retiró): el color es
del dato, no del usuario.

### 3b. Color por métrica — **PROVISIONALES (por definir)**
Cada estadística lleva su color para diferenciarse (modelo Apple Fitness). Los valores
actuales son **placeholders**; cuando se decidan, se cambian en un único sitio (los `--m-*`).
```
--m-rdy   #0A84FF  readiness
--m-hrv   #30D158  HRV
--m-rhr   #FF375F  FC reposo
--m-sleep #64D2FF  sueño
--m-steps #FF9F0A  pasos
--m-weight #8E8E93 peso
```
Al fijarlos: que sean distinguibles entre sí, legibles sobre `--surface` en ambos temas, y
que no choquen semánticamente (p. ej. evita verde puro para una métrica "mala").

### 3c. Gradiente IA
```
--ai-grad: linear-gradient(115deg, #FF6FD8, #A78BFA, #5AC8FA);  /* estilo Apple Intelligence */
```
Uso **exclusivo** del componente de coach (§7b): barra superior de 3px, texto del badge
(con `background-clip:text`) y el LED pulsante. En ningún otro sitio.

---

## 4. Espaciado, radios, bordes, elevación

```
Espaciado (escala de 4):  4 · 8 · 12 · 14 · 18 · 24 · 32 · 48
Radios:    --r 16px  ·  --r-sm 11px     (tarjetas tipo iOS; controles = píldora 99px)
Bordes:    1px solid var(--line)        ← separación en oscuro
Elevación: oscuro = sin sombra (borde + --hi de 1px arriba). Claro = --shadow suave iOS.
```
Un widget típico:
`background: var(--surface); border: 1px solid var(--line); border-radius: var(--r);
box-shadow: var(--shadow), inset 0 1px 0 var(--hi);`
El `inset 0 1px 0 var(--hi)` es la **luz superior de 1px** (bisel premium), no una sombra difusa.

---

## 5. Layout — bento + dashboard de widgets editable

- Container: ancho cómodo, no estrecho tipo landing. Aprovecha el ancho.
- Rejilla de 12 columnas, filas de altura mínima ~112px, `grid-auto-flow: dense`.
- **Bento asimétrico**: una celda dominante (Readiness/gráfica) + celdas menores. Nunca 4
  cards idénticas en fila.
- Unidades (`ms`, `bpm`, `h`, `kg`) pequeñas, en `--text-muted`, pegadas al número.

### Dashboard `Hoy` = lienzo de widgets editable (decisión tomada)
La pestaña `Hoy` es un **dashboard de widgets que el usuario configura**, estilo widgets de
la pantalla de inicio de iOS.

- **Cada panel es un widget**: **mover** (drag), **redimensionar** (tamaños discretos),
  **añadir** y **quitar** desde un catálogo (Readiness, HRV, sueño, RHR, pasos, peso, coach…).
- **Snap a la rejilla de 12 columnas.** Tamaños en **escalones fijos** (p. ej. 1×1, 2×1,
  2×2, 4×2 en celdas), nunca píxel a píxel → la composición nunca se rompe.
- **Readiness** es el widget por defecto y dominante.
- **Dos modos**: *vista* (limpio, sin manijas) y *editar* (**jiggle** tipo iOS, botón circular
  rojo para quitar, manija de resize, botón "Añadir widget").
- **Persistencia**: el layout es del usuario. Modelo: lista de `{widgetId, x, y, w, h}`.

---

## 6. Shell — navegación y header

### Navegación — regleta (decisión tomada)
Rail estrecho a la izquierda (≈66px), **sin iconos Lucide**.

- **Desktop**: cada pestaña es **numeral + label corto** apilados (`01 Hoy`, `02 Tnd`,
  `03 Ent`, `04 Prf`). Numeral en mono. Inactivas en `--text-faint`; **activa = cápsula
  rellena** sutil (`--surface-2`) con label en `--text` (selección tipo sidebar iOS).
- **Ancla de identidad**: arriba del rail, el **Readiness compacto** (número + barra) — la
  nav la firma el componente firma, no un logo.
- **Móvil**: **tab bar inferior** nativa de iOS (el uso será mayoritariamente en el teléfono;
  sincronizas desde un Atajo de iOS). Activa marcada por color/peso, estilo nativo.

### Header de cada pestaña
Wordmark `SmartPeak · Hoy` discreto + estado de sincronización. Debajo, una **tira meta** fina
(fecha · fuente). El control primario ("Sincronizar") es un botón **píldora monocromo**.

### Pestañas
`Hoy` (dashboard de widgets) · `Tendencias` (históricos HRV/sueño/peso) · `Entreno`
(autorregulación por rol) · `Perfil` (rol, tema, sincronización).

---

## 7. Componente firma — Readiness

- Score **0–100** (HRV + sueño + RHR). Cifra-héroe en `--text-3xl`, mono, color `--text`
  (neutro, **no** el color del anillo: el número se lee, el anillo da el color).
- **Anillo** de progreso en su color `--m-rdy`, con count-up al cargar (§8).
- Etiqueta de estado debajo (`Recuperado` / `Moderado` / `Fatiga`) coloreada con
  `--pos`/`--warn`/`--neg`.
- Versión compacta (número + barra) vive en el rail, presente en toda la app.

### 7b. Métricas con anillo
Cada métrica (HRV, RHR, sueño, pasos, peso…) se representa como **anillo + cifra**, con el
color de su token `--m-*`. El anillo se puede hacer con `conic-gradient` + máscara radial
(ver mock). El delta (↑/↓ %) va como texto en color `--pos`/`--neg`/`--text-muted`.

### 7c. Coach IA
Única superficie elevada (`--surface-2`) con el **gradiente IA** (§3c): barra superior de
3px, badge con texto en gradiente y LED pulsante. Contiene el plan del día y chips de datos
(carga, HRV 7d, racha).

---

## 8. Movimiento

Catálogo derivado de las skills de motion (Emil Kowalski + `impeccable/animate`). Regla madre:
**toda animación necesita un propósito** declarable en una frase (feedback, cambio de estado,
jerarquía o transición). Si no lo tiene, **bórrala** — la calma premium se rompe con motion
decorativo. `review-animations` es la rúbrica de revisión.

### Reglas duras (no negociables)
- **Solo animar `transform` y `opacity`** (GPU). Nunca `width/height/margin/padding/top/left`
  ni `transition: all`.
- **Curvas:** entrar/salir → `ease-out` con curva fuerte; mover/morphing → `ease-in-out`.
  **Nunca `ease-in` en UI** (retrasa lo que el usuario mira). **Nunca bounce/elastic** en motion
  funcional. Tokens:
  ```css
  --ease-out:    cubic-bezier(0.16, 1, 0.30, 1);   /* expo: entradas, count-up, anillos */
  --ease-out-ui: cubic-bezier(0.23, 1, 0.32, 1);   /* hover, press, estados */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);  /* mover/reordenar */
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);   /* sheets/drawers iOS */
  ```
- **Duración (UI siempre < 300ms salvo entradas de dato):** feedback de pulsación 100–160ms ·
  estados/transiciones 150–250ms · cambios de layout 300–500ms · entrada de dato (count-up,
  llenado de anillo) 500–800ms.
- **Timing asimétrico:** la salida ≈ 75% de la entrada. Lento donde el usuario decide, rápido
  donde el sistema responde.
- **Nunca animar desde `scale(0)`**: arranca en `scale(0.96)` + `opacity:0`.
- **Interrumpibilidad:** usa transiciones CSS / WAAPI (no `@keyframes`) para lo que puede
  reorientarse a mitad (anillo que retarget al recalcular Readiness, drag).
- **Reveals por scroll:** `IntersectionObserver` o scroll-driven CSS, **nunca** listeners de
  scroll.

### Comportamientos concretos
- **Count-up (cifras):** el número cuenta hasta su valor en 500–800ms con `--ease-out`. La cifra
  va en mono **`tabular-nums`** para que no haya jitter de ancho. Es animación de *llegada de
  dato* (ocasional), permitida; nunca en datos que cambian a alta frecuencia.
- **Anillos (Readiness y métricas):** `stroke-dashoffset` con `--ease-out`, 500–800ms en la
  primera carga; al recalcular, transición CSS interrumpible (no keyframe). Sin bounce. El
  **color** del anillo es su `--m-*`; la cifra del centro es neutra (§7).
- **Press:** todo elemento accionable hace `transform: scale(0.97)` en `:active`, ~140ms
  `--ease-out-ui`.
- **Stagger de widgets:** entrada escalonada 30–80ms (`animation-delay: calc(var(--i)*50ms)`),
  cap total ~500ms; decorativo, no bloquea interacción. Umbral de "instantáneo": ~80ms.
- **Modo edición:** *jiggle* sutil tipo iOS (solo en ese modo).
- **Coach:** LED del badge en pulso lento (≈2.6s). El gradiente IA es la **única** zona con
  gradiente (§3c).
- **Transición de pestaña:** crossfade 150–250ms + leve translate, o nada. Indicador de tab
  activo deslizante. No animar la navegación si pasa a ser de alta frecuencia.
- **Springs Apple-style** (`bounce` 0.1–0.3) solo para gestos/drag (p. ej. pull-to-refresh del
  sync); nunca para datos funcionales.
- **Materiales:** `blur` sutil (<20px) solo para enmascarar crossfades imperfectos.

### Accesibilidad de motion
- **`prefers-reduced-motion`: reducir, no eliminar.** Mantén opacity/color y el resultado final;
  quita el movimiento: count-up → muestra el número final directo; anillo → fija el offset final;
  stagger/jiggle → off.
- **Hover solo en dispositivos con puntero fino:** envuelve estilos de hover en
  `@media (hover: hover) and (pointer: fine)` (el uso es mayoritariamente móvil).

---

## 9. Flujo de construcción con Claude Code (2 fases)

**Fase 1 — Bloquear el sistema.** Antes de cualquier feature:
1. Implementa los tokens (§2–4) como CSS variables + config de Tailwind.
2. Carga la fuente mono (la UI usa la del sistema).
3. Construye la pestaña `Hoy` (dashboard de widgets + Readiness + coach) como vitrina. Itera
   SOLO sobre esto hasta que el tono sea correcto. Base: [mockup-mono.html](mockup-mono.html).
4. Construye el shell (rail + tab bar móvil) con la pestaña activa.

**Fase 2 — Construir contra el sistema bloqueado.** El resto de pestañas reutilizan tokens y
patrones validados. Si una pestaña necesita algo nuevo, añádelo a este doc primero.

**Pendiente de decidir:** los **colores por métrica** (§3b) siguen siendo provisionales.

**Recordatorio para cada PR de UI:** ¿el chrome es monocromo y el color vive solo en los
datos? ¿las cifras van en mono/tabular? ¿usa solo tokens (cero colores literales)? ¿evita
los puntos del §0? ¿es navegable por teclado con foco visible y usa HTML semántico (§10)?

---

## 10. Accesibilidad (a11y) y semántica — **obligatorio**

El look Apple-grade incluye comportarse como una app nativa: navegable, semántica, con contraste.
No es opcional ni "para luego".

- **HTML semántico, no `div`-soup.** Usa `<nav>`, `<main>`, `<article>`, `<section>`, `<button>`,
  `<a>` por su significado. Un control que navega es `<a>`; uno que actúa es `<button>` (nunca un
  `<div onClick>`). Encabezados (`<h1>`–`<h3>`) en orden, sin saltarse niveles por estética.
- **Teclado primero.** Todo elemento interactivo debe ser alcanzable con `Tab` y accionable con
  `Enter`/`Space`. Orden de foco lógico. **Foco visible** usando `--accent` (no lo quites con
  `outline:none` sin reemplazo). Atajos de iOS aparte: la web se opera con teclado.
- **Estado y nombre accesibles.** Iconos/controles sin texto llevan `aria-label`. El widget activo
  de la nav y el modo edición exponen su estado (`aria-current`, `aria-pressed`). Anillos y
  gráficas tienen un equivalente textual (la cifra ya está en el DOM, no solo en el SVG).
- **Contraste.** Texto sobre `--surface` cumple AA en ambos temas; al fijar los `--m-*` (§3b)
  verifica contraste, no solo que "se distingan". `--text-faint` es para adornos, no para texto
  que haya que leer.
- **Movimiento.** Respeta `prefers-reduced-motion` (ya en §8): count-up, jiggle y pulso del LED
  se desactivan o reducen.
- **Headless con accesibilidad incluida.** Para menús, diálogos, tabs y drag del dashboard, parte
  de Radix/headless (foco, roles, `Esc`, focus-trap) y vístelo con tokens — no reimplementes a11y a mano.

---

## 11. Interacción y estados (de `impeccable` + `design-taste-frontend`)

- **8 estados por elemento interactivo:** `default · hover · focus-visible · active · disabled ·
  loading · error · success`. No diseñes solo el estado feliz.
- **Foco:** `:focus-visible` con outline 2–3px, `outline-offset`, contraste ≥3:1, usando
  `--accent` (monocromo). Nunca `outline:none` sin reemplazo.
- **Touch targets ≥ 44×44px** (uso mayoritariamente móvil). Usa `min-h-[100dvh]`, no `h-screen`.
- **Carga:** prefiere **skeletons** a spinners; el skeleton respeta la forma del widget.
- **Acciones destructivas:** prefiere **deshacer** a diálogos de confirmación cuando se pueda
  (p. ej. quitar un widget del dashboard).
- **Formularios (Perfil, ajustes):** label **visible** sobre el input (el placeholder no es
  label); valida en `blur`; el error va debajo, ligado con `aria-describedby` y en `--neg`.
- **Jerarquía por espacio + peso + color**, no por tamaño solo (refuerza §2). Agrupación tight
  (8–12px) + separación generosa entre bloques.
- **Cuando implementes los tokens de color (§3):** formato **OKLCH** y dos capas (primitivos →
  semánticos; en claro/oscuro solo se redefinen los semánticos). Neutros con un punto de chroma
  hacia el hue (0.005–0.015), no grises planos ni "cream" tintado de relleno. Contraste AA:
  cuerpo ≥4.5:1, texto grande ≥3:1. Nunca gris claro "por elegancia" para texto legible.
