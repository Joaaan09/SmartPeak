# Dispositivo — Inventario del KSIX Ring y disponibilidad de datos

> Referencia: qué mide la pulsera, qué llega a SmartPeak y por qué vía.
> Creado 2026-06-30. Mantener actualizado si cambia el dispositivo o la integración.

## 1. Contexto

El usuario usa un **KSIX Ring** (anillo) que vuelca **parte** de su biometría a **Apple Health**;
SmartPeak la recoge con la estrategia "Pull" (Atajo de iOS → POST al backend). El problema de
fondo: **la app nativa del anillo registra mucho más de lo que exporta a Salud**, y **no permite
exportar de ninguna forma** (ni CSV, ni "compartir", ni otra integración — es una app cerrada y
pobre). De ahí la estrategia de ingesta por **captura de pantalla + IA** para los datos que no
salen de su app.

## 2. Inventario y vía de entrada

Vías: ① **Sync** (Apple Health, automático) · ② **Captura + IA** (foto de la app → visión la lee →
confirmas → guarda solo los valores) · ③ **Derivado** (lo calcula el backend) · ④ **Futuro** (otro
bloque, aún no).

| Dato | App nativa | Exporta a Salud | Vía en SmartPeak |
|---|---|---|---|
| Pasos | ✅ | ✅ | ① Sync |
| FC (prom/mín/máx + serie horaria) | ✅ | ✅ | ① Sync |
| Energía / calorías | ✅ | ✅ | ① Sync |
| Sueño (fases + duración) | ✅ | ✅ | ① Sync |
| Distancia | ✅ | ❔ no aparece hoy en el payload | — |
| Puntuación de actividad | ✅ | — | Se ignora (irrelevante) |
| **HRV** (prom/mín/máx + serie) | ✅ | ❌ | ② Captura + IA ⭐ prioritaria |
| **HRV media durante el sueño** | ✅ | ❌ | ② Captura + IA ⭐ (la buena para recovery) |
| FC media durante el sueño | ✅ | ❌ | ② Captura + IA (opcional, mejor "reposo") |
| SpO₂ (y SpO₂ durante el sueño) | ✅ | ❌ | ② Captura + IA (opcional) |
| Temperatura corporal (y nocturna) | ✅ | ❌ | ② Captura + IA (opcional) |
| Latencia de conciliación del sueño | ✅ | ❌ | ② Captura + IA (opcional) |
| **Estrés** | ✅ | ❌ | ③ Derivado de la HRV (no se introduce) |
| Entrenamientos (FC máx/media, gráfica, **zonas** con minutaje) | ✅ | ❌ | ④ Futuro bloque "Registro de entreno" |

**Lo que llega por Sync hoy** (confirmado capturando el payload real de HAE):
`step_count`, `heart_rate`, `active_energy`, `sleep_analysis`. Nada más.

## 3. Calidad de los datos (criterio)

- **HRV y FC *durante el sueño* = dato premium para recuperación.** Es lo que usan Whoop/Oura
  (HRV en sueño profundo). Si se introduce HRV, debe ser la **"variabilidad media durante el
  sueño"**, no una medida diurna puntual. La **FC media durante el sueño** es mejor "reposo" que
  el proxy actual `heartRate.min`.
- **Estrés**: no se introduce; se **deriva** de la HRV vs baseline (HRV baja → estrés alto). Será
  un "estrés autonómico en reposo" (foto matutina), no el continuo de la pulsera. Ver
  `decisiones.md` (2026-06-30 · Estrés vía HRV manual).

## 4. Las 3 vías de entrada manual (conviven)

Para los datos que **no** salen a Apple Health (HRV, SpO₂, temperatura, FC-sueño, latencia):

1. **Teclear en la app** — control total, sin IA. Fallback siempre disponible.
2. **Subir foto en la app** — la IA de visión extrae los campos, **los muestra para que los
   revises/corrijas**, y guardas. Confirmación en pantalla.
3. **Atajo de iOS** — la de **menor fricción**, para el día a día (mismo patrón que el sync
   biométrico):
   - Seleccionas las capturas en el carrete (HRV, sueño, estrés…) y ejecutas el Atajo.
   - El Atajo hace **POST a un endpoint nuevo** (p. ej. `/api/ingest/capturas`) con las imágenes,
     autenticado con el **mismo `x-sync-token` por usuario** del sync (no JWT — el Atajo no hace
     login).
   - La IA **clasifica** cada captura (qué pantalla es) y **extrae** los campos → **JSON
     estructurado y corto** (cumple §4: la IA no calcula, solo lee).
   - **Upsert idempotente** en el `DailyMetrics` del día, sin pisar otros campos (mismo merge que
     el sync), con `source: "ocr"`.
   - **Confirmación diferida + por confianza**: el dato entra marcado **"sin revisar"**; la IA
     reporta confianza por campo. Lo de alta confianza se da por bueno; lo dudoso lleva badge
     **"revisar"** y se valida de un toque la próxima vez que abras la app → fricción mínima sin
     guardar basura a ciegas.

### Ubicación en la UI (decidido 2026-06-30 · ver `decisiones.md`)

Las 3 vías se colocan por **granularidad del dato**, no todas en el mismo sitio:

- **Teclado (un valor)** → **página de detalle de cada métrica** (`/metrica/:metricKey`):
  añadir/editar ese dato, incluido corregir días del histórico. Es el **hogar** del dato.
- **Foto / captura (multi-métrica = volcado del día)** → **un único flujo central
  «Importar desde captura»**, lanzado como **acción desde `Hoy`** (hoja «Añadir datos de hoy»).
  La IA extrae y **reparte cada valor a su métrica**. NO se trocea por página (una captura del
  anillo trae varias métricas; filtrarla a una sola desperdicia el resto).
- **Atajo de iOS** → sin UI (POST directo; la de menor fricción, para el día a día).
- **Revisión** de lo leído con baja confianza → **aviso ligero en `Hoy`** («N datos sin
  revisar →»), no pantalla propia.

**Descartado:** UI en **Perfil** (es configuración, no datos diarios) y **pestaña propia** para
capturas (la barra de navegación es para destinos, no acciones; el día a día ya es el Atajo).

## 5. Detalles técnicos a tener presentes (al implementar)

- **Es una llamada a IA con visión** → **excepción consciente a CLAUDE.md §4**, pero legítima: es
  **ingesta/lectura** (OCR de la captura), no un cálculo que pudiera hacer el código. Anotar la
  excepción en `decisiones.md` al implementar.
- **Privacidad / almacenamiento**: se guardan **solo los valores extraídos**, no la imagen.
- **Tamaño del payload**: varias imágenes pesan → subir el límite en ese endpoint (recordar las 3
  capas NPM → nginx frontend → Express) o que el Atajo comprima antes de enviar.
- **Fecha del dato**: la IA saca la fecha de la captura si está visible; si no, se asume el día de
  referencia (como el sync exporta "ayer"). Clave para no machacar el día equivocado en
  `DailyMetrics`.
- **Modelo de IA**: necesita **visión**. Para *leer capturas* basta el modelo de visión más
  económico; se fija al diseñar el bloque (con pricing real). Enlaza con la decisión pendiente
  "modelo de IA" — que ahora sabemos que **debe soportar visión**.

## 6. Estado actual

- **Hoy** entran por sync `pasos / FC / energía / sueño`. **HRV / SpO₂ / temperatura NO entran aún**
  (ni manual ni captura). El **Estrés** figura como "Próximamente (requiere HRV)" en la pestaña Hoy.
- **Pendiente**: implementar la entrada manual (las 3 vías), **empezando por la HRV**. Al hacerlo se
  activa el **estrés derivado** y se completa el componente **HRV del Readiness**.
