# SmartPeak — Sistema de Diseño

> Documento de referencia para construir la UI. Es una **restricción dura**: cualquier
> pantalla nueva se construye DENTRO de este sistema, no se improvisa. Si algo no está
> aquí, se decide y se añade aquí primero, luego se implementa.
>
> Referencia viva: la **landing** (`logos/SmartPeak Landing.html`) es ahora el **norte visual**
> de la marca (tipografía, paleta, estructura). [mockup-mono.html](mockup-mono.html) es la
> implementación canónica de la pestaña `Hoy`, ya alineada con la landing. Si el doc y el mock
> divergen, gana lo que se decida y se actualizan ambos.

Tono base: **marca SmartPeak · premium · calmado**, alineado con la landing y con **un mínimo
de aire Apple**. Superficies tinta (oscuro) / papel (claro) limpias, mucho aire pero con datos
densos y legibles. Tipografía de marca (**Space Grotesk** + **Space Mono**), chrome **monocromo**
y **el color vive solo en los datos** (cada métrica tiene su color). Tiene IA integrada y se nota
por el contenido, no por color. Confiado, sobrio, no clínico-agresivo.

---

## 0. Restricciones negativas (el "nada de…")

Estas reglas existen para evitar el look genérico de IA. No las rompas sin actualizar este doc.

- ❌ **Nada de `shadcn/ui` con sus estilos por defecto.** Puedes usar Radix/headless como
  base de comportamiento (accesibilidad), pero el estilo lo pones tú con estos tokens.
- ❌ **Nada de un color de marca que domine la app.** No hay acento de marca. El chrome
  (botones, nav, ticks) es **monocromo**; el color aparece **solo en los datos** (§3).
- ❌ **Nada de gradientes decorativos.** Como la landing, **no hay gradientes** en el chrome
  (el coach es monocromo — decisión 2026-06-29). El único gradiente tolerado es el de relleno
  bajo una **gráfica de datos**, en el color `--m-*` de esa métrica (§7b).
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
Las skills instaladas (`emil-design-eng`, `review-animations`, `design-taste-frontend`) son
**guía de craft, no autoridad**: ante conflicto **manda este doc**.
No adoptes de ellas:
- ❌ Subir los *dials* de variance / "toma un riesgo estético audaz" / asimetría artsy
  (taste-skill por defecto 8/6/4) → SmartPeak es **calmado**: variance baja, motion bajo.
- ❌ Fuentes display "con personalidad" inventadas a capricho → la tipografía está **fijada por
  la marca/landing**: **Space Grotesk** (UI) + **Space Mono** (datos y eyebrows). No se cambian
  por gusto; la del sistema es solo *fallback* (§2).
- ❌ El ban del *hero-metric* (que desaconsejan algunas skills) → aquí **el dato es el héroe** (§1); mostramos
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
   siendo neutro (tinta/papel) — y la app sigue siendo SmartPeak por su tipografía (Space
   Grotesk + Space Mono), su rejilla de widgets y el anillo de Readiness.
4. **La IA, presente pero contenida.** El coach se distingue por su superficie elevada y su
   contenido, **no por color** (es monocromo, como la landing). Comunica "esto es inteligente"
   sin teñir la app.
5. **Un movimiento bueno, no diez.** El micro-movimiento comunica cambio de dato (un número
   que cuenta, un anillo que se llena), no decora. Excepción: el *jiggle* del modo edición (§5).

---

## 2. Tipografía

Dos roles, **iguales que la landing** (cargadas vía Google Fonts):

- **UI / display** (títulos, navegación, cuerpo, botones): **Space Grotesk**.
  - Stack: `'Space Grotesk', -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif`.
  - La del sistema es solo *fallback* (mantiene un mínimo el tono Apple si la fuente falla).
    Pesos 400 / 500 / 600 / 700.
- **Cifras / datos + eyebrows técnicos**: **Space Mono** con `tabular-nums`.
  - Toda métrica, eje, tabla **y los labels técnicos en mayúsculas** (eyebrows de sección y de
    widget) van en Space Mono.

Dos reglas de oro:
1. **Cualquier número que sea un dato va en Space Mono** con `font-variant-numeric: tabular-nums`.
2. **Los eyebrows/labels técnicos van en Space Mono, MAYÚSCULAS, `letter-spacing:.1em`,
   peso 700, `--text-muted`** (utilidad `.eyebrow`). Es la firma tipográfica de la landing
   (p. ej. `PREPARACIÓN`, `SUEÑO`, `COACH IA · POWERLIFTING`).
   El resto (títulos, copy de frase, botones) va en Space Grotesk.

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
gritadas: prefiere **Capitalización normal** salvo en los labels técnicos (eyebrows).

---

## 3. Color — neutro + color solo en los datos

**No hay color de marca.** Las superficies son neutras (**tinta** en oscuro, **papel** en claro,
igual que la landing) y el chrome es monocromo. El color entra exclusivamente por: (a) el
**color de cada métrica** y (b) las **señales** semánticas. **No hay gradiente IA** (el coach es
monocromo desde 2026-06-29).

> **Nota (alternativa abierta):** se valoró un **monocromo total** (datos incluidos, 100% como la
> landing). De momento se mantiene "color solo en datos" por la utilidad de escaneo en un
> dashboard real (modelo Apple Fitness); el monocromo total queda **anotado como opción futura**.

### Tokens semánticos (lo que consumen los componentes)
```css
:root {
  --bg / --surface / --surface-2      /* superficies neutras (tinta/papel) */
  --line / --line-strong              /* hairlines y divisores */
  --text / --text-muted / --text-faint
  --accent / --accent-text            /* énfasis de UI MONOCROMO (botón, tick). NO es marca */
  --pos / --neg / --warn              /* señales fijas: verde / rojo / ámbar */
  --m-rdy / --m-hrv / --m-rhr /       /* COLOR POR MÉTRICA — provisionales (§3b) */
  --m-sleep / --m-steps / --m-weight
  --ring-track                        /* pista de la barra/anillo sin rellenar */
  --hi / --shadow / --r / --r-sm      /* luz superior 1px · sombra · radios */
}
```
Reglas:
- `--accent` es **monocromo** (≈ blanco en oscuro, ≈ negro en claro). Pinta botón primario,
  cápsula de nav activa y foco. Nunca es un color saturado.
- `--pos`/`--neg`/`--warn` son **fijos** y significan lo mismo en todos los temas.
- Los `--m-*` solo se usan en su métrica (anillo + trazo de su gráfica). Ningún componente
  de chrome usa un `--m-*`.

### Temas (valores copiados TAL CUAL de la landing)
```
Dark / "tinta" (default):
  --bg #0E0F12  --surface #16181D  --surface-2 #1C1F26
  --line #262931  --line-strong #333845
  --text #F4F4F1  --text-muted #9A9C9F  --text-faint #65676C
  --accent #F4F4F1  --accent-text #14161B
  --pos #30D158  --neg #FF453A  --warn #FFD60A
  --ring-track #20232A   --hi rgba(255,255,255,.05)   --shadow none

Light / "papel":
  --bg #EFEFEC  --surface #FFFFFF  --surface-2 #F6F6F3
  --line #E6E6E1  --line-strong #D8D8D2
  --text #14161B  --text-muted #5A5C61  --text-faint #9D9E98
  --accent #14161B  --accent-text #FFFFFF
  --pos #34C759  --neg #FF3B30  --warn #FF9F0A
  --ring-track #E6E6E1   --hi transparent   --shadow 0 1px 2px rgba(0,0,0,.05), 0 8px 22px rgba(0,0,0,.05)
```
(`--line-strong`, `--ring-track` y los `--m-*` no los define la landing; se derivan aquí.)
El usuario **solo** alterna claro/oscuro. No hay selector de acento (se retiró): el color es
del dato, no del usuario.

### 3b. Color por métrica — **DEFINIDOS (2026-06-29)**
Cada estadística lleva su color para diferenciarse (modelo Apple Fitness). **Importante:** la
landing es monocroma y **no** define estos colores; se **diseñaron aquí** para armonizar con la
marca tinta/papel. Se cambian en un único sitio (los `--m-*` de `tokens.css`).
```
                 dark / tinta   light / papel   métrica
--m-rdy           #0A84FF        #0A78E6         azul — RESERVADO para gráficas de readiness;
                                                 el ANILLO de Preparación va por estado (§7)
--m-hrv           #2BC9B8        #0E9484         VFC — teal
--m-rhr           #FF6482        #E23E64         FC en reposo — rosa
--m-sleep         #8278F6        #5F58E0         Sueño — índigo
--m-steps         #FF9F0A        #C2700A         Pasos — naranja
--m-weight        #E5B83C        #9C7A1A         Peso — oro
--m-energy        #FF7847        #CC5526         Energía activa — coral (añadido 2026-06-30)
```
Criterios aplicados: (1) **hues separados** entre sí (azul · teal · rosa · índigo · naranja ·
oro · coral); (2) **distintos de las señales** `--pos`(verde)/`--neg`(rojo) para no confundir el
color de una métrica con su delta; (3) **legibles sobre `--surface` en ambos temas** → el tema
papel usa variantes más profundas (los colores vivos pierden contraste sobre blanco). Regla de
uso: cada `--m-*` aparece **solo en el dato** de su métrica (anillo, sparkline, barra), nunca en
el chrome.
**`--m-energy` (coral) es PROVISIONAL** (como el resto de `--m-*`): energía y pasos forman la
familia cálida "carga"; energía toma un coral más rojizo que el ámbar de pasos y se separa del
rojo puro de `--neg` por su componente naranja. Pendiente de validación visual junto a Pasos.

### 3c. ~~Gradiente IA~~ — RETIRADO (2026-06-29)
El coach es **monocromo** como la landing: sin gradiente, sin barra superior de color. La señal
de "inteligente" la dan la superficie elevada (`--surface-2`), el eyebrow técnico y un LED
neutro que respira. Único gradiente tolerado: el relleno bajo una gráfica, en su `--m-*` (§7b).

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

### Navegación — regleta (decisión tomada · revisada 2026-06-30)
Rail a la izquierda con **icono + label apilados**. **Iconos SÍ, pero SOLO custom** (SVG
inline propios, estilo `MoonIcon`: `stroke="currentColor"`, trazo fino ~1.5, `aria-hidden`,
monocromos). **Lucide sigue vetada** y el chrome sigue monocromo (el color vive solo en los
datos). La finura manda: bordes 1px `--line`, **sin sombras pesadas ni tiles macizos**; el
tile activo es un relleno sutil, no una card.

- **Set de iconos** (uno por pestaña, todos monocromos `currentColor`):
  - `Hoy` → **dot relleno** (●, "ahora / en directo") — es su icono propio, no el marcador de activo.
  - `Tendencias` → **barras** (mini bar-chart).
  - `Entreno` → **chevron/caret arriba** (∧, progresión/levantar).
  - `Perfil` → **persona** (cabeza + hombros, contorno).
  - Toggle de tema → `MoonIcon` (ya existe).
- **Desktop**: cada pestaña = **icono + label largo** (`Hoy`, `Tendencias`, `Entreno`,
  `Perfil`) apilados. Ancho del rail el necesario para que `Tendencias` quepa holgado en una
  línea (~96–112px). Inactivas en `--text-faint`; **activa = tile relleno sutil `--surface-2`**
  con icono+label en `--text` (selección tipo sidebar iOS). El **indicador de activo es el
  tile**, no el dot.
- **Ancla de identidad**: arriba del rail se mantiene el **Readiness compacto** (número +
  barra) — la nav la firma ese componente, no un logo.
- **Toggle de tema** al pie del rail (`MoonIcon`), separado de la nav.
- **Móvil**: **tab bar inferior** nativa de iOS con **icono + label** (mismos iconos que el
  rail), activa marcada por color/peso. El toggle de tema NO va en la tab bar (vive en Perfil).

### Header de cada pestaña
Wordmark **pico + `SmartPeak · Hoy`** discreto (el "pico" de la marca, ver `client/public/brand`)
+ estado de sincronización. El control primario ("Sincronizar") es un botón **píldora monocromo**
(relleno `--accent`, como el botón blanco de la landing).

### Pestañas
`Hoy` (dashboard de widgets) · `Tendencias` (históricos HRV/sueño/peso) · `Entreno`
(autorregulación por rol) · `Perfil` (rol, tema, sincronización).

---

## 7. Componente firma — Readiness (anillo · color = estado)

Representación **principal = anillo de progreso**, y su **color refleja el ESTADO de
recuperación** (decisión 2026-06-29): **verde** `--pos` (Recuperado) / **ámbar** `--warn`
(Moderado) / **rojo** `--neg` (Fatiga). Así el color del aro ya comunica cómo estás, no es un
azul fijo. Estructura:

- **Anillo** (track `--ring-track`, trazo en el color del estado), con count-up + llenado en
  sincronía al cargar (§8). En el centro: cifra-héroe **0–100** (HRV + sueño + RHR) en Space
  Mono, color `--text` (**neutra** — el número se lee, el anillo da el color) + eyebrow
  `PREPARACIÓN` (`.eyebrow`).
- Debajo: etiqueta de estado (`Recuperado`/`Moderado`/`Fatiga`) en el mismo color del estado +
  subtítulo en `--text-muted`.
- Versión compacta (número + mini-barra, **también coloreada por estado**) vive en el rail.
- `--m-rdy` (azul) queda **reservado** para gráficas de readiness (p. ej. su tendencia), no para
  el anillo (que va por estado).

### 7b. Métricas con anillo
Cada métrica (HRV, RHR, sueño, pasos, peso…) se representa como **anillo + cifra**, con el
color de su token `--m-*` (el color sigue viviendo en el dato). El anillo se hace con
`conic-gradient` + máscara radial (ver mock). El delta (↑/↓ %) va como texto en color
`--pos`/`--neg`/`--text-muted`. La tendencia es una **gráfica de línea** en `--m-*` con relleno
de área degradado en ese mismo color.

### 7c. Coach IA — monocromo
Superficie elevada (`--surface-2`), **sin gradiente** (decisión 2026-06-29): eyebrow técnico
`COACH IA · <ROL>` (`.eyebrow`) con un **LED neutro** (`--text-muted`) que respira (§8), título
en Space Grotesk, plan del día y chips de datos en Space Mono (carga, HRV 7d, racha).

---

## 8. Movimiento

Catálogo derivado de las skills de motion (Emil Kowalski). Regla madre:
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
- **Anillos (Readiness y métricas):** `stroke-dashoffset`/`conic-gradient` con `--ease-out`,
  500–800ms en la primera carga; al recalcular, transición CSS interrumpible (no keyframe). Sin
  bounce. La cifra del centro es neutra (§7). El **color** del anillo de Readiness es el del
  **estado** (`--pos`/`--warn`/`--neg`); el de cada métrica es su `--m-*`.
- **Press:** todo elemento accionable hace `transform: scale(0.97)` en `:active`, ~140ms
  `--ease-out-ui`.
- **Stagger de widgets:** entrada escalonada 30–80ms (`animation-delay: calc(var(--i)*50ms)`),
  cap total ~500ms; decorativo, no bloquea interacción. Umbral de "instantáneo": ~80ms.
- **Modo edición:** *jiggle* sutil tipo iOS (solo en ese modo).
- **Coach:** LED **neutro** (`--text-muted`) del eyebrow en pulso lento (≈2.6s). Sin gradiente.
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
2. Carga las fuentes de marca (Space Grotesk + Space Mono); el sistema es solo *fallback*.
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

## 11. Interacción y estados (de `design-taste-frontend`)

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

### 11b. Estados de dato del widget (vacío / sin dato / próximamente) — añadido 2026-06-30
La pantalla `Hoy` se alimenta de datos reales (`GET /api/metrics/latest`). Un widget puede estar
en uno de estos estados; **distínguelos visualmente, no los mezcles** (extiende §11 — no solo el
estado feliz). Regla común: el widget **conserva su chrome y su tamaño** (no se oculta ni colapsa,
para no romper el bento); lo que cambia es el contenido del dato.

- **Con dato (feliz):** cifra en Space Mono `tabular-nums`, color `--m-*` en el anillo/gráfica, y
  delta si hay histórico. **Sin histórico aún → NO se muestra delta** (no se inventan ↑/↓); el
  hueco del delta queda vacío, no con un "0%".
- **Sin dato hoy** (la métrica es real pero el sync no la trajo ese día): cifra = `—` en
  `--text-faint`, anillo en `--ring-track` (sin color de métrica), caption breve tipo
  `sin dato`. El label de la métrica se mantiene legible (no atenuado del todo).
- **Próximamente** (métrica/feature aún no implementada: HRV·SpO2·Peso de entrada manual, y
  Readiness·Coach·Tendencia hasta su cálculo): badge/eyebrow mono **`PRÓXIMAMENTE`** en
  `--text-faint`, **sin color de métrica** (anillo en `--ring-track` o ausente), sin cifra. El
  conjunto va atenuado (contenido del dato a baja prominencia) pero el **borde y el label siguen
  legibles** para comunicar "esto vendrá". No es interactivo (no es botón) y lleva
  `aria-disabled`/texto accesible que lo anuncie. No usar el rojo `--neg` ni tono de error: es
  ausencia por diseño, no fallo.
- **Cargando:** skeleton que respeta la forma del widget (§11), nunca spinner; pulso suave (§8).
- **Estado vacío global** (`dailyMetrics: null`, aún no se sincronizó nada): además de las cards
  en "sin dato", muestra una llamada a la acción sobria que **apunta al botón Sincronizar**
  (texto tipo "Aún no hay datos — pulsa Sincronizar"). Monocromo, sin ilustración recargada.

---

## 12. Vista de detalle de métrica (desglose intradía) — añadido 2026-06-30

Al pulsar una card de métrica con dato en `Hoy` se abre su **vista de detalle**: el desglose de
esa métrica (intradía por horas, o por fases en el caso del sueño).

### Patrón de navegación
- **Push a pantalla completa DENTRO del shell**: vive en su propia ruta (`/metrica/:metricKey`)
  anidada bajo `AppLayout`, así la **regleta (desktop) y la tab bar (móvil) permanecen** (como
  Apple Salud). No es modal ni bottom-sheet.
- **Cabecera propia** (no el `AppHeader` de pestaña): botón **«‹ Hoy»** que vuelve a `Hoy`
  (navegable por teclado, target ≥44px) + **eyebrow técnico** con el nombre de la métrica
  (`.eyebrow`, p. ej. `PASOS · HOY`). Debajo, la **cifra-héroe** del día en mono `tabular-nums`.
- El **atrás del navegador** también cierra la vista (es una URL real).

### Cards clickables (extiende §11)
- Solo la card en estado **`data`** es interactiva; se renderiza como **`<a>`** (un control que
  navega es `<a>`, §10) hacia `/metrica/:key`. `empty`/`soon` **no** son interactivas.
- Estados: **hover** = realce sutil (borde `--line-strong` / superficie `--surface-2`), **solo**
  bajo `@media (hover: hover) and (pointer: fine)`; **`:active`** `scale(0.97)`; **`:focus-visible`**
  outline con `--accent`. El chrome sigue **monocromo**; el color sigue solo en el dato.

### Gráficas del desglose
SVG **hecho a mano** (como `TrendWidget`, no librería), `preserveAspectRatio:none`, color = el
`--m-*` de la métrica, **cifras y ejes en mono `tabular-nums`**. Equivalente textual siempre en el
DOM (cifra + stats, no solo el SVG). Tipos:
- **Acumulativas (pasos · energía)** → **barras por hora**. Eje 00–23 con pocos ticks; una hora
  sin dato se ve (barra a 0). Se **resalta el pico** del día.
- **FC** → **banda mín–máx** (área en `--m-rhr` a baja opacidad) + **línea de media**. Reposo = mín.
- **Sueño (sin serie horaria)** → **barra de fases apilada** (profundo/REM/ligero/despierto)
  proporcional a la duración, fases diferenciadas por **opacidad de `--m-sleep`** (despierto en
  `--ring-track`/`--text-faint`) + lista de fases (duración + %) + fila `inicio → fin`.
- Relleno de área degradado permitido en su `--m-*` (§7b). Sin gradientes en el chrome.

### Estados y motion (§11/§11b/§8)
- **Cargando** → skeleton que respeta la forma (cifra + bloque de gráfica), nunca spinner.
- **Sin serie** (métrica real pero el sync no trajo intradía ese día) → mensaje sobrio
  «sin desglose disponible» conservando la cabecera; **vacío global** si `dailyMetrics:null`.
- **Métrica no real** en la URL (HRV/SpO₂/Peso/`soon` o param inválido) → redirige a `/`.
- **Entrada**: barras/línea aparecen con `--ease-out` (transform/opacity), <800ms; **respeta
  `prefers-reduced-motion`** (sin movimiento, resultado final visible).

### 12b. Tooltip interactivo de las gráficas (hover desktop · tap móvil) — añadido 2026-06-30
Las gráficas del desglose exponen el valor de cada punto **bajo demanda** (no se rotulan todos los
valores, para no saturar):
- **Puntero fino (desktop)**: al **hover** sobre la gráfica, un tooltip sigue la hora/segmento bajo
  el cursor y muestra su valor; se oculta al salir (`@media (hover: hover) and (pointer: fine)`).
- **Táctil (móvil) — scrub**: **tocar o ARRASTRAR** el dedo por la gráfica mueve el punto/segmento
  activo y su tooltip, que **siguen al dedo** (la guía/punto va detrás del gesto). Al **levantar el
  dedo** el tooltip **se mantiene** visible (para leer el valor); **tap fuera** de la gráfica lo
  cierra. No hay hover en táctil → la pulsación/arrastre es el gesto. Implementación: el scrub **NO
  captura el puntero** (sin `setPointerCapture`), de modo que `touch-action: pan-y` **arbitra** el
  gesto — un arrastre **horizontal** recorre la gráfica (scrub) y un arrastre **vertical** (aunque
  empiece sobre la gráfica) hace **scroll de la página**. `pointerdown` fija el punto (feedback de tap
  inmediato), `pointermove` con el dedo abajo lo sigue, `pointerup` lo deja visible; cuando el
  navegador decide quedarse el gesto para hacer scroll vertical dispara `pointercancel`, que **oculta
  el tooltip** que hubiera aparecido. No hay "toggle-off" al tocar el mismo punto (chocaría con el
  arrastre); el descarte es por tap-fuera o moviéndose a otro punto. Mecánica compartida en el hook
  genérico `usePointerScrub` (`useHourScrubber` es un wrapper fino sobre 24 horas).
- **Sin selección de texto/callout**: las zonas interactivas de las gráficas desactivan la selección
  de iOS/Safari con `user-select:none` (+ `-webkit-user-select`) y `-webkit-touch-callout:none` (mata
  la lupa/menú al mantener pulsado), y usan `touch-action: pan-y` para que el **scroll vertical de la
  página** siga funcionando aunque el gesto empiece sobre la gráfica (el gesto horizontal es el
  scrub; al no capturar el puntero, `pan-y` puede arbitrar). Utilidad reutilizable `.sp-chart-scrub`
  (las tres gráficas la usan: barras, FC y la barra de fases del sueño).
- **Tooltip**: burbuja elevada (`--surface-2`, borde `--line`, `--shadow`) con la hora/label en mono
  y el valor en mono coloreado con el `--m-*` de la métrica. **Se mantiene dentro de los límites de
  la gráfica** (clamp horizontal; nunca se sale del viewport a 375px). El punto/barra/segmento activo
  se resalta (opacidad plena / guía vertical).
- **Motion (§8)**: aparición fade + `scale(0.96→1)` <200ms `--ease-out`; respeta
  `prefers-reduced-motion` (aparece sin transform).
- **A11y (§10)**: es **mejora progresiva** — el equivalente textual ya vive en el DOM (cifra-héroe +
  `DetailStats` + `aria-label` del `role="img"`). Donde sea barato, la gráfica es enfocable y las
  flechas mueven el punto activo; el sueño usa **un único contenedor enfocable** (`role="img"`,
  `tabIndex=0`) sobre la barra de fases (sin `<button>` por fase) que gobierna hover/tap/arrastre/
  teclado vía `usePointerScrub`, con un **hit-area táctil cómodo (~44px)** mediante padding vertical
  transparente sin mover visualmente la barra de 16px; la lista textual de fases (duración + %) es el
  equivalente accesible.
- **Responsividad**: la vista de detalle y sus gráficas se construyen mobile-first; sin scroll
  horizontal a 375px, tooltips clampados, labels de eje legibles y targets táctiles cómodos.

---

## 13. Instalación / Añadir a pantalla de inicio (PWA) — añadido 2026-06-30

Vive en **Perfil**, como una `<section>` más (mismo patrón de header/eyebrow). Es **monocromo**:
no hay datos, así que **sin color** (tinta/papel). Bifurca por plataforma (`features/pwa`):
- **Android/Chromium** → botón `ghost` "Instalar app" que dispara el **prompt nativo**
  (`beforeinstallprompt` diferido, un solo uso).
- **iOS Safari** (sin prompt) → guía manual en un **`<details>` semántico** (disclosure accesible
  por teclado, sin JS): Compartir → Añadir a pantalla de inicio → Añadir. El `<summary>` se estiliza
  como control (foco visible, sin el marcador feo); los pasos aparecen con un fundido sutil
  (opacity/transform, §8) que `prefers-reduced-motion` neutraliza.
- **Ya instalada (standalone)** o **navegador sin soporte** → la sección **no se renderiza**.

---

## 14. Scores derivados en Hoy (interpretación biométrica) — añadido 2026-06-30

Además de los datos **crudos** (FC reposo, pasos, energía activa en kcal), `Hoy` muestra los
**scores derivados** que el backend calcula al vuelo (`GET /api/metrics/latest` → `scores`). Son
cinco, todos **0–100**, y traducen la biometría a una lectura accionable:

| Score | Token | Card en `Hoy` | Detalle intradía |
|---|---|---|---|
| **Preparación** (Readiness) | por estado (§7) | widget firma (anillo) | no |
| **Calidad de sueño** | `--m-sleep` | card de Sueño (anillo = calidad) | sí (fases) |
| **Nivel de energía** | `--m-energylvl` | card propia | **no** |
| **Esfuerzo** (Strain) | `--m-strain` | card propia | **no** |
| **Estrés** | — (`--text-faint`) | "Próximamente" (`requiere HRV`) | no |

### Regla de color (clave): valencia vs. neutralidad
- **Preparación** (y el futuro **Estrés**) tienen **valencia buena/mala** → se pintan **por
  estado** con el **semáforo** `--pos`/`--warn`/`--neg` (como el anillo de Readiness, §7). El
  color ya dice "cómo estás".
- **Calidad de sueño, Nivel de energía y Esfuerzo** se pintan con su **token `--m-*` propio** y el
  **estado va en el caption** (texto, no color). Motivo: el **esfuerzo es neutro** — un día de
  mucha carga **no es "malo"** (pintarlo en rojo mentiría); cada métrica conserva su color (§3).

### Cards
- **Sueño** (`--m-sleep`, navegable): el **anillo representa la calidad (0–100%)**; el dato
  principal es la calidad en `%` y las **horas pasan a sub-dato** del caption
  (`"<estado> · <horas>"`, p. ej. `Bueno · 7h 12m`). Sin score de calidad, cae al
  comportamiento previo (horas crudas) o a "sin dato".
- **Nivel de energía** (`--m-energylvl`, **no navegable**): score + estado (Bajo/Medio/Alto) en el
  caption. Sin score → la card **no se muestra** (no se inventa un vacío).
- **Esfuerzo** (`--m-strain`, **no navegable**): score + estado (Bajo/Moderado/Alto) en el caption.
  Sin score → no se muestra.
- **Estrés**: card en estado **"Próximamente"** con el motivo concreto **"requiere HRV"** (el
  estrés se infiere del HRV, aún sin entrada manual). Usa el patrón `soon` de §11b con un
  `reason` específico en lugar del copy genérico.

### Badge de confianza (cold-start)
Preparación expone la **confianza** del cálculo. En `confidence === 'low'` (pocos días de
histórico) **NO se finge precisión**: el subtítulo del widget lo avisa
(`Confianza baja · pocos días de histórico`); `medium` → `Confianza media`; `high` → subtítulo
útil. Se reutiliza el slot `sub` del widget (§7), sin rediseñarlo.

### Tokens nuevos (provisionales, como el resto de `--m-*`, §3b)
```
                 dark / tinta   light / papel   métrica
--m-energylvl     #32D6E0        #0E95A0         Nivel de energía — cian/turquesa
--m-strain        #C46BFF        #8E3FD6         Esfuerzo — violeta/magenta
```
Hues **separados** de los existentes (rdy azul · hrv teal · rhr rosa · sleep índigo · steps
naranja · weight oro · energy coral) y de las señales `--pos`/`--warn`/`--neg`: `--m-energylvl` es
un **cian más azulado y brillante** que el teal verdoso del HRV; `--m-strain` es un
**violeta-magenta** más rojizo que el índigo azulado del sueño. Papel usa variantes más profundas
(contraste sobre blanco). El `--m-energy` (coral) actual se queda para la **energía activa cruda**
en kcal — no es lo mismo que el nivel de energía interpretado.

### Mapa estado → texto (captions, español)
```
sleepQuality   excellent→Excelente · good→Bueno · fair→Regular · poor→Malo
energyLevel    low→Bajo · medium→Medio · high→Alto
strain         low→Bajo · moderate→Moderado · high→Alto
readiness      recovered→Recuperado · moderate→Moderado · fatigue→Fatiga (label del anillo, §7)
```

### Disposición en el bento (§5)
Orden de lectura: **HERO** (Preparación + Coach) → **scores interpretados** (Sueño · Nivel de
energía · Esfuerzo) → **crudos** (FC reposo · Pasos · Energía activa) → **Próximamente** (Estrés ·
Tendencia) → **manuales** (HRV · SpO₂ · Peso). El grid es `auto-flow:dense`; se respetan los spans
actuales (scores y crudos en span 3, Readiness 5×2, Coach 4×2, Tendencia span 8).
