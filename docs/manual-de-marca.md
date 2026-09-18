# Manual de marca — Cursos Cesde

Versión 1.0 · Formaliza el sistema visual ya vigente en `src/styles/tokens.css` (prefijo `--c-`,
tipografía `system-ui`, azul `#1f4e79`). No propone una identidad nueva: corrige incoherencias y
fija reglas verificables para que cualquier desarrollador decida sin preguntar.

Fuente de verdad de tokens: `src/styles/tokens.css`. Ningún otro archivo debe declarar literales
de color, espaciado o tamaño de fuente; todo pasa por variable.

## 1. Principios

1. **Funcional antes que decorativo.** La interfaz es una herramienta de gestión (cursos,
   docentes): prioriza legibilidad, densidad de datos y velocidad de tarea sobre ornamento.
2. **Un solo azul, un solo acento.** `--c-primary` (#1f4e79) es la única marca de acción/identidad;
   no se introducen segundos colores de marca ni degradados.
3. **Los tokens son la ley.** Ningún componente ni página declara un color, tamaño de fuente,
   espaciado o radio fuera de `tokens.css`. Si una necesidad no está cubierta, se añade un token,
   no un literal local.
4. **Evita** adornos sin función (sombras decorativas, iconografía redundante, colores de estado
   fuera de la paleta de `--c-success` / `--c-warning` / `--c-danger`) y evita re-implementar un
   patrón que `src/ui/**` ya resuelve.

## 2. Color

Cálculo de contraste WCAG 2.2 con la fórmula de luminancia relativa estándar (sRGB → lineal,
`0.2126R + 0.7152G + 0.0722B`), umbrales AA: **4.5:1** texto normal, **3:1** texto grande
(≥24px, o ≥18.66px con peso ≥700) y bordes/estado de controles (SC 1.4.11). Script de cálculo
ejecutado ad hoc, sin herramienta externa; valores redondeados a dos decimales.

### 2.1 Superficie y texto

| Token | Valor | Uso previsto | Contraste medido | AA |
|---|---|---|---|---|
| `--c-bg` | `#f5f6f8` | Fondo de app | — (fondo, no es par de texto) | — |
| `--c-surface` | `#ffffff` | Tarjetas, inputs, modal, topbar | — | — |
| `--c-surface-muted` | `#f1f3f6` | Fondo de thead, disabled, hover neutro | — | — |
| `--c-text` | `#16202c` | Texto principal | sobre `--c-bg`: **15.21:1** · sobre `--c-surface`: **16.44:1** · sobre `--c-surface-muted`: **14.79:1** | Cumple (texto normal) |
| `--c-text-muted` | `#5b6b7f` | Texto secundario, placeholder, hint, thead label, nav inactivo | sobre `--c-surface`: **5.45:1** · sobre `--c-surface-muted`: **4.90:1** · sobre `--c-bg`: **5.04:1** | Cumple (texto normal, 4.5:1) |
| `--c-text-inverse` | `#ffffff` | Texto sobre botón primario/danger | sobre `--c-primary`: **8.66:1** · sobre `--c-primary-hover`: **10.82:1** · sobre `--c-danger`: **6.47:1** · sobre `--c-danger-hover`: **8.31:1** | Cumple |

### 2.2 Marca y estado

| Token | Valor | Uso previsto | Contraste medido | AA |
|---|---|---|---|---|
| `--c-primary` | `#1f4e79` | Botón primario, link, nav activo, foco | como texto/icono sobre `--c-surface`: **8.66:1** · como texto sobre `--c-primary-soft`: **7.47:1** | Cumple |
| `--c-primary-hover` | `#184060` | Hover de botón primario | sobre `--c-surface` (link hover): **10.82:1** | Cumple |
| `--c-primary-soft` | `#e8eff6` | Fondo de badge/nav-activo primario | — (fondo) | — |
| `--c-success` | `#15803d` | Texto/badge/toast de éxito | sobre `--c-success-soft`: **4.46:1** | **No cumple** (normal, exige 4.5:1; el texto de Badge y Toast usa `--c-text-xs`/`--c-text-sm`, no califica como "grande") |
| `--c-success-soft` | `#e7f5ec` | Fondo badge/toast éxito | — | — |
| `--c-warning` | `#b45309` | Texto/badge/banner demo de advertencia | sobre `--c-warning-soft`: **4.58:1** | Cumple, margen mínimo (0.08); vigilar si se retoca la paleta |
| `--c-warning-soft` | `#fdf3e6` | Fondo banner/badge advertencia | — | — |
| `--c-danger` | `#b91c1c` | Texto de error, botón danger, badge/toast danger | sobre `--c-danger-soft`: **5.66:1** · sobre `--c-surface`: **6.47:1** · sobre `--c-bg`: **5.98:1** | Cumple |
| `--c-danger-hover` | `#991b1b` | Hover de botón danger | ver 2.1 (texto inverso) | Cumple |
| `--c-danger-soft` | `#fdecec` | Fondo badge/toast danger | — | — |

**Corrección propuesta — `--c-success`:** `#15803d` sobre `#e7f5ec` da 4.46:1, por debajo de 4.5:1.
Con `#126d34` (mismo matiz, oscurecido) el contraste sube a **5.72:1** sobre `--c-success-soft` y
**6.44:1** sobre `--c-surface`, con margen cómodo y sin cambiar la percepción de "verde éxito".

### 2.3 Bordes y foco (contraste no textual, SC 1.4.11)

| Token | Valor | Uso previsto | Contraste sobre `--c-surface` | AA (3:1) |
|---|---|---|---|---|
| `--c-border` | `#dde2ea` | Borde de reposo de Input/Select/Textarea/Button secundario; divisor de Table/Modal/Card | **1.30:1** | **No cumple** como borde de control interactivo |
| `--c-border-hover` | `#c6cdd9` | Borde de hover de Input/Select/Textarea | **1.60:1** | **No cumple** |
| `--c-border-focus` | `#1f4e79` | Anillo de foco (`:focus-visible`, outline 2px) | **8.66:1** | Cumple con margen amplio |

**Corrección propuesta:** `--c-border` y `--c-border-hover` fallan 1.4.11 en su uso como borde de
control formulario (Input, Select, Textarea en reposo/hover no tienen ningún otro indicador de
límite). Como el mismo token también se usa como divisor decorativo (tabla, modal, card, topbar)
donde 1.4.11 no aplica igual —no es la única pista del límite de un componente interactivo—, la
corrección mínima es **añadir un token nuevo** en vez de oscurecer todo:

```css
--c-border-control: #828a99;   /* 3.47:1 sobre #ffffff — reposo de Input/Select/Textarea/Button secundario */
--c-border-control-hover: #6b7280; /* verificar >=3:1 antes de fijar; más oscuro que --c-border-control */
```

y usar `--c-border-control` en `Input.css`, `Select.css`, `Textarea.css` (borde de reposo y hover)
y en el borde de `Button--secondary`. `--c-border` sigue sirviendo para separadores decorativos
(filas de tabla, borde de modal/card, topbar) sin tocar esos archivos.
Alternativa de un solo token, si se prefiere no ampliar la paleta: subir `--c-border` a `#828a99`
globalmente — asumiendo que tablas, tarjetas y modal se ven con un borde más marcado.

### 2.4 No verificado / fuera de alcance de este cálculo

- Estados con opacidad (`.ui-button:disabled { opacity: 0.55 }`, `.ui-table__sort-icon--muted { opacity: 0.35 }`)
  quedan exentos de AA en el caso de `disabled` (WCAG excluye componentes inactivos), pero el
  icono de orden inactivo (no disabled) sí es visible e interactivo: `--c-text-muted` al 35% sobre
  `--c-surface-muted` da un color efectivo `#bcc3cc`, contraste **1.60:1** contra el fondo del
  thead. No es texto ni el único indicador de "columna ordenable" (la palabra de la cabecera es
  clicable y `aria-sort` lo anuncia), por lo que no es un incumplimiento estricto de 1.4.11, pero
  es un candidato a revisar si se decide tratarlo como control visual con estado.
- No se midió contraste de imágenes, iconos SVG con relleno degradado, ni de nada fuera de
  `tokens.css` (no hay otras fuentes de color en el repo).

## 3. Tipografía

Pila: `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
(`--c-font`). Sin fuente propia: usa la fuente nativa del sistema operativo del usuario, cero
peso de descarga, máxima velocidad de primer render.

| Token | Tamaño | Peso en uso | Rol |
|---|---|---|---|
| `--c-text-xs` | 12px | 500, 600 | Metadatos: hint, error de campo, thead uppercase, badge |
| `--c-text-sm` | 13px | 400, 500 | Texto secundario: botón `sm`, input/select `sm`, toolbar, toast, label de `Field` |
| `--c-text-base` | 14px | 400, 500 | Cuerpo por defecto (`body`), tabla, input/select `md`, textarea, botón `md` |
| `--c-text-md` | 16px | 600 | Título de `EmptyState` |
| `--c-text-lg` | 20px | 600 | Título de topbar, título de `Modal` |
| `--c-text-xl` | 24px | 600 | Título de página (`h1`/`h2` de Cursos, Docentes) |
| `--c-text-2xl` | 30px | 600 | Código de error de página 404 |

Pesos en uso: sólo **400** (cuerpo), **500** (labels, botones, nav, texto de énfasis medio) y
**600** (títulos). No hay peso 700 en el repo: ningún texto califica como "grande y negrita" para
efectos de WCAG, así que la escala de contraste de texto grande (3:1) no aplica salvo por tamaño
≥24px (`--c-text-2xl`, `--c-text-xl` bien pasado ese umbral en la práctica ya que todos los pares
de texto miden ≥4.46:1, ver §2).

## 4. Espaciado y radios

Escala de espaciado en base 4 (`--c-space-1` a `--c-space-10`: 4/8/12/16/20/24/32/40px). Regla de
uso:

- `space-1` (4px): separación mínima dentro de un grupo (label-input en `Field`, fila de tarjeta).
- `space-2` (8px): gap entre icono y texto, gap entre botones cercanos.
- `space-3` (12px): padding horizontal de control `sm`, gap entre campos de un mismo grupo (rango).
- `space-4` (16px): padding de card/panel, gap entre campos de un formulario o filtro, padding de contenido móvil.
- `space-5`/`space-6` (20/24px): padding de modal, gap y padding de layout de página.
- `space-8`/`space-10` (32/40px): padding de estado vacío, tamaños de icono circular.

Radios: `--c-radius-sm` (4px) en controles pequeños y foco; `--c-radius` (6px) por defecto en
botón/input/select/textarea/toast; `--c-radius-lg` (10px) en superficies contenedoras (modal,
tabla, panel de filtros); `--c-radius-full` en badge y avatar/icono circular.

## 5. Altura de control

Regla vigente y obligatoria: **`sm` = 32px** para cromo (barra de filtros, acciones de fila de
tabla, toggle de menú) y **`md` = 40px** para formularios de captura (modales de creación/edición).
`size` es una prop **requerida sin valor por defecto** en `Button`, `Input`, `Select` y `Textarea`
(`src/ui/shared/controlSize.ts`) — decisión deliberada para que ningún consumidor "herede" un
tamaño implícito y decida siempre a propósito.

Por qué existe la distinción: el cromo (filtros, orden, paginación, acciones por fila) convive con
mucha densidad de información por pantalla — se prioriza compacidad. Los formularios de captura
son eventos aislados y de una sola tarea a la vez dentro de un modal — se prioriza objetivo táctil
y legibilidad. Mezclar tamaños dentro del mismo contexto (p. ej. un botón `md` dentro de una fila
de tabla) rompe la alineación vertical con el resto de controles de esa fila.

## 6. Estados obligatorios

### 6.1 De componente (Input/Select/Textarea/Button)

| Estado | Regla |
|---|---|
| Reposo | `--c-border` (ver corrección §2.3) / fondo `--c-surface` |
| Hover | `border-color: --c-border-hover` (Input/Select/Textarea) o fondo `--c-surface-muted` (Button secundario/ghost) |
| Foco | `outline: 2px solid --c-border-focus` con `outline-offset`, sólo vía `:focus-visible` (no en click con mouse) |
| Activo | Heredado del sistema del navegador; no hay estado `:active` explícito adicional en el token set — pendiente de definir si se necesita feedback de "pulsación" distinto del hover |
| Deshabilitado | `opacity: 0.55` en Button; fondo `--c-surface-muted` + `color: --c-text-muted` + `cursor: not-allowed` en Input/Select/Textarea |
| Error | `border-color: --c-danger` (`invalid`/`aria-invalid`), mensaje enlazado por `aria-describedby` vía `Field` |
| Cargando | `Button` con `loading`: `aria-busy`, sustituye el icono izquierdo por `Spinner` sin mover el layout; deshabilita el control mientras carga |

### 6.2 De toda vista de datos (patrón `Table` + `EmptyState`)

1. **Cargando**: 5 filas esqueleto (`SKELETON_ROWS`) con barra pulsante (`ui-table__skeleton-bar`,
   `prefers-reduced-motion` respetado).
2. **Vacío** (sin filtros activos): `EmptyState` con mensaje de "aún no hay registros" + acción de
   creación primaria.
3. **Vacío con filtros**: `EmptyState` con mensaje distinto ("no se encontraron... con estos
   filtros") + acción secundaria "Quitar/Limpiar filtros". Implementado en `CursosPage.tsx` y
   `DocentesTable.tsx` condicionando el mensaje a `filtrosActivos`/`query`.
4. **Error**: `EmptyState` con icono de alerta, mensaje del error y botón "Reintentar" que
   dispara `refetch`.

Este patrón de 4 estados está bien resuelto y replicado en Cursos y Docentes: reutilizarlo tal
cual en cualquier vista de datos nueva, no crear una variante local.

## 7. Accesibilidad

- **Foco visible**: `:focus-visible` global en `base.css` + refuerzo por componente (Input,
  Select, Textarea). No se dibuja anillo en interacción por mouse, sí por teclado.
- **Etiquetas reales**: `Field` asocia `label`/`htmlFor` con `id` real, nunca placeholder-como-label.
  Excepción a revisar: el buscador de `DocentesTable.tsx` (líneas 95-105) usa una `<label>` manual
  en vez de `Field`, por lo que no hereda `aria-describedby` ni el patrón de error — hoy no lo
  necesita (no tiene hint/error), pero si se le añade alguno quedará inconsistente con el resto.
- **Error enlazado**: `Field` genera `id-error` y lo conecta vía `aria-describedby` +
  `aria-invalid`, con `role="alert"` en el mensaje.
- **Objetivo táctil mínimo**: controles `sm`/`md` (32/40px) superan el mínimo de 24×24px de WCAG
  2.2 SC 2.5.8. Excepción real encontrada: el botón de cerrar de `Toast` no declara `width`/
  `height` (`src/ui/Toast/Toast.css:43-52`), por lo que su área clicable es el tamaño del icono
  (14×14px) — **incumple 2.5.8**. Corrección: replicar el patrón de `.ui-modal__close` (`width`/
  `height: var(--c-control-sm)`).
- **Contraste**: ver §2; corregir `--c-success` y el borde de reposo/hover de controles antes de
  dar el sistema por conforme.
- **`prefers-reduced-motion`**: respetado globalmente en `base.css` (anula duración de
  animación/transición) y explícitamente en `Spinner.css`. No hay animaciones fuera de estas dos
  fuentes (transiciones de color/borde de 150ms, skeleton pulse, spinner de carga).

## 8. Responsive

Puntos de quiebre reales: **640px** y **1024px** (más un techo de `1023.98px` para evitar solape
con `min-width: 1024px` en `AppShell.css`).

- **< 640px**: nav lateral oculto → menú desplegable superior; `Table` colapsa a lista de tarjetas
  (`data-label` como etiqueta por celda, thead oculto visualmente); `Modal` ocupa toda la pantalla
  sin radios; `CursosFilters` colapsa detrás de un botón "Filtros (n)" con panel plegable en
  columna; `Toast` se ancla a los bordes izquierdo/derecho.
- **640–1024px**: nav lateral se convierte en rail de iconos (60px, label oculta visualmente pero
  accesible); columnas `priority: 'secondary'` de `Table` (Duración, Descripción en Cursos; Correo
  en Docentes) se ocultan para evitar scroll horizontal.
- **≥ 1024px**: nav lateral fijo de 232px; layout completo, sin colapsos.

## 9. Qué NO hacer

- **No** fijar un tamaño de control por contexto sin pensarlo: `size="sm"` es obligatorio en
  cromo, `size="md"` en formularios. Ejemplo real correcto a imitar: `CursosTable.tsx` usa `size="sm"`
  en las acciones de fila; `CursoFormModal.tsx` usa `size="md"` en todos los campos del formulario.
- **No** meter 8 controles de filtro en una sola fila flexible sin gobierno de ancho mínimo.
  Ejemplo real a corregir: `CursosFilters.css:27-32` (`.cursos-filters__panel { flex-wrap: wrap;
  gap: var(--c-space-4) }`) reparte el ancho en partes iguales entre 5 grupos sin `min-width`,
  lo que en 1440px deja ~100px por input en los campos de rango — ver Hallazgos.
- **No** dejar una columna de tabla sin ancho gobernado cuando conviven texto corto (nombre) y
  texto largo (descripción). Ejemplo real: `Table.css` no tiene `table-layout: fixed` ni `width`
  por columna — ver Hallazgos.
- **No** repetir el título de la sección en el `caption` de la tabla inmediatamente debajo.
  Ejemplo real: `CursosTable.tsx:101` (`caption="Listado de cursos"`) bajo el `h2` "Cursos" de
  `CursosPage.tsx:109`.
- **No** dejar un botón icon-only sin área táctil explícita. Ejemplo real: `Toast.css:43-52`
  (`.ui-toast__close` sin `width`/`height`) frente al patrón correcto de `Modal.css:45-56`.
- **No** usar el formato de fecha por defecto del navegador sin pista visible del formato
  esperado por la aplicación. Ejemplo real: `CursosFilters.tsx:152-173` (`type="date"`, sin
  `hint`) y `CursoFormModal.tsx:146-163` (`type="datetime-local"`, `hint` sólo en modo edición y
  no habla de formato).
- **No** introducir un segundo `h1` en la misma página. Ejemplo real: `AppShell.tsx` ya declara
  `<h1 className="app-shell__title">Cursos Cesde</h1>` en el topbar; `DocentesPage.tsx:83` agrega
  un segundo `<h1 className="docentes-page__title">Docentes</h1>` en la misma página renderizada.

## Hallazgos

Prioridad: **alta** (bloquea AA o rompe la tarea) · **media** (degrada la experiencia de forma
visible) · **baja** (pulido).

| Prioridad | Hallazgo | Dónde | Por qué importa | Corrección |
|---|---|---|---|---|
| Alta | Borde de reposo/hover de Input, Select, Textarea y Button secundario no cumple contraste no-textual (1.30:1 y 1.60:1, se exige 3:1, SC 1.4.11) | `src/styles/tokens.css:16-17` (`--c-border`, `--c-border-hover`), consumido en `Input.css:3,26`, `Select.css:10,29`, `Textarea.css:5,24`, `Button.css:51` | Con baja visión, el límite del campo es casi invisible sobre fondo blanco; afecta a todos los formularios de captura | Añadir `--c-border-control: #828a99` (3.47:1) y usarlo en el borde de reposo/hover de estos 4 componentes; mantener `--c-border` para divisores decorativos |
| Alta | Botón de cerrar de `Toast` sin área táctil explícita (hereda el tamaño del icono, 14×14px) | `src/ui/Toast/Toast.css:43-52` | Incumple WCAG 2.2 SC 2.5.8 (mínimo 24×24px); inconsistente con `Modal.css:45-56` que sí define `width`/`height: var(--c-control-sm)` | Añadir `width`/`height: var(--c-control-sm)` a `.ui-toast__close`, igual que `.ui-modal__close` |
| Alta | Ocho controles de filtro en una sola fila flexible sin ancho mínimo gobernado; el campo "Buscar" lleva un `hint` debajo que lo desalinea de sus vecinos | `src/features/Cursos/components/CursosFilters.tsx:87-205`, `CursosFilters.css:27-47` | Confirmado: a 1440px, contenido disponible ≈1160px (1440 − 232 nav − 48 padding), panel interno ≈1064px repartidos en 5 grupos de `flex:1 1 0` ⇒ ~213px por grupo; los grupos de rango (precio/fecha/duración) parten ese ancho entre 2 inputs ⇒ ~100px por input, insuficiente para etiquetas como "Duración mínima (semanas)" (~25 car., 1 sola línea necesita ≈180px), que se parten en 2–3 líneas. Además, `.cursos-filters__panel { align-items: flex-end }` alinea todo por la base: como "Buscar" es el único campo con `hint` (una línea extra de `Field.css:18-21`), su input queda más alto que los demás en la misma fila, desalineándolo visualmente | Dar `min-width` explícito a `.cursos-filters__field`/`.cursos-filters__range > *` (p. ej. 160px) y dejar que el `flex-wrap` reparta en más de una fila en vez de comprimir; mover el hint de "Buscar" a `title`/`aria-description` o reservarle una fila propia para no romper la alineación del resto |
| Media | Columnas de la tabla sin ancho gobernado: nombres de docente pueden partirse en varias líneas mientras "Descripción" toma una porción desproporcionada | `src/ui/Table/Table.css` (sin `table-layout: fixed` ni `width` por columna), columnas declaradas en `src/features/Cursos/components/CursosTable.tsx:39-88` | Confirmado por ausencia de gobierno: `table-layout` por defecto es `auto`, así que el ancho se reparte según el contenido máximo de cada columna; "Descripción" (texto largo, sin `max-width`) consume el ancho disponible a costa de columnas de texto corto como "Docente", forzando su wrap | Fijar `table-layout: fixed` en `.ui-table` y declarar `width`/`max-width` por columna (o un `colgroup`), con `text-overflow: ellipsis` + `title` en "Descripción" en vez de dejarla crecer libre |
| Media | `--c-success` sobre `--c-success-soft` da 4.46:1, por debajo de 4.5:1 para texto normal | `src/styles/tokens.css:26-27`, consumido en `Badge.css:23-26` (variante `success`, texto `--c-text-xs`) y `Toast.css:26-29` (variante `success`, texto `--c-text-sm`) | El texto de badge/toast de éxito no califica como "grande" (12–13px, peso ≤500), así que exige 4.5:1 y no lo alcanza | Cambiar `--c-success` a `#126d34` (5.72:1 sobre `--c-success-soft`, 6.44:1 sobre `--c-surface`) |
| Media | El caption de la tabla de cursos repite el tema del encabezado de sección inmediatamente superior | `src/features/Cursos/components/CursosTable.tsx:101` (`caption="Listado de cursos"`) vs. `src/features/Cursos/CursosPage.tsx:109` (`<h2 id="cursos-page-title">Cursos</h2>`) | Redundancia semántica: un lector de pantalla anuncia "Cursos" (sección) y de inmediato "Listado de cursos" (caption) sin aportar información nueva. **Corrección respecto al hallazgo original**: el encabezado repetido es un `h2` de la página, no el `h1` — el único `h1` real de la app está en `AppShell.tsx:78` ("Cursos Cesde", topbar), y no coincide textualmente con el caption | Cambiar el caption a algo que aporte contexto no repetido (p. ej. describir el criterio de orden/filtro activo) o quitarlo si `aria-labelledby` de la `<section>` ya cubre la asociación semántica |
| Media | Campos de fecha sin formato visible ni pista de formato esperado | `src/features/Cursos/components/CursosFilters.tsx:152-173` (`type="date"`, sin `hint`); `src/features/Cursos/components/CursoFormModal.tsx:146-163` (`type="datetime-local"`, `hint` sólo para modo edición, no habla de formato) | Confirmado: el resto de la app formatea fecha en es-CO (`formatearFechaLegible`, `src/shared/format/date.ts:27-33`, ej. "09 feb 2026, 06:00 p. m."), pero el control nativo de fecha muestra el formato/orden de campos del navegador (con locale del SO, no necesariamente es-CO), sin placeholder ni hint que ancle la expectativa | Añadir `hint` fijo tipo "Formato: día/mes/año" en los 4 campos de fecha, o sustituir por un input de texto con máscara/`Field` que controle el formato de forma explícita |
| Media | Segundo `h1` en la página de Docentes | `src/features/Docentes/DocentesPage.tsx:83` (`<h1 className="docentes-page__title">Docentes</h1>`) además del `h1` de `src/app/layout/AppShell.tsx:78` ("Cursos Cesde") que envuelve toda ruta | Dos `h1` en el mismo documento rompen la jerarquía de encabezados que usan lectores de pantalla para navegar; además es inconsistente con `CursosPage.tsx:109`, que usa correctamente `h2` para el mismo rol de "título de página" | Cambiar `docentes-page__title` a `<h2>`, igual que `CursosPage.tsx`, conservando la clase/estilo |
| Baja | Ningún distintivo de marca en la barra superior | `src/app/layout/AppShell.tsx:64-81` (`TopBar`) | Confirmado: el topbar sólo renderiza el botón de menú y el `<h1>` de texto "Cursos Cesde"; no hay logo/isotipo/marca gráfica | Añadir un ícono/isotipo de 20-24px antes del título, reutilizando el mismo `currentColor` que ya usan `IconCursos`/`IconDocentes` para no introducir un color nuevo |
| Baja | Icono de orden inactivo casi invisible | `src/ui/Table/Table.css:49-51` (`.ui-table__sort-icon--muted { opacity: 0.35 }`) | `--c-text-muted` al 35% de opacidad sobre `--c-surface-muted` da un color efectivo ≈`#bcc3cc`, contraste 1.60:1 contra el fondo del thead. No es el único indicador de que la columna es ordenable (el texto de cabecera ya es clicable y anuncia `aria-sort`), por lo que no es un incumplimiento estricto de AA, pero dificulta descubrir la afordancia a simple vista | Subir la opacidad mínima a ~0.6 o usar un color con más contraste en vez de opacidad sobre `currentColor` |
| Baja | Buscador de Docentes no usa el primitivo `Field` | `src/features/Docentes/components/DocentesTable.tsx:95-105` | Usa `<label>` manual en vez de `Field`; hoy no tiene hint/error, pero si se le agrega alguno no heredará `aria-describedby` automático y quedará inconsistente con el resto del formulario/filtros | Migrar a `Field` para mantener un único patrón de campo+etiqueta+ayuda en toda la app |

### Hallazgos del enunciado: verificación contra el código

1. **Confirmado.** 8 controles de filtro en una fila flexible sin ancho mínimo; a 1440px el
   cálculo de caja da ~100px por input en los campos de rango, insuficiente para las etiquetas más
   largas, y el `hint` de "Buscar" desalinea ese campo del resto por `align-items: flex-end`.
2. **Confirmado.** `Table.css` no gobierna ancho de columna (`table-layout` por defecto, sin
   `width` por columna); con "Descripción" como texto largo sin tope, las columnas cortas como
   "Docente" quedan comprimidas.
3. **Confirmado con corrección de detalle.** El caption "Listado de cursos" sí repite el
   encabezado de sección inmediatamente superior, pero ese encabezado es un `h2` ("Cursos",
   `CursosPage.tsx:109`), no un `h1`. El único `h1` de la app vive en el topbar (`AppShell.tsx:78`,
   "Cursos Cesde") y no coincide textualmente con el caption.
4. **Confirmado.** Los inputs `type="date"`/`type="datetime-local"` de `CursosFilters.tsx` y
   `CursoFormModal.tsx` no llevan ningún `hint` de formato (salvo un hint no relacionado con
   formato en modo edición); el resto de la app sí formatea fechas en es-CO.
5. **Confirmado.** `AppShell.tsx` no renderiza ningún logo/isotipo en el topbar, sólo texto.

### Hallazgos propios (no estaban en el enunciado)

- Borde de reposo/hover de Input/Select/Textarea/Button secundario no cumple 3:1 (1.30:1 / 1.60:1) — alta.
- Botón de cerrar de `Toast` sin `width`/`height`, incumple objetivo táctil mínimo de 24×24px — alta.
- `--c-success` sobre `--c-success-soft` da 4.46:1, por debajo de 4.5:1 — media.
- Segundo `h1` en `DocentesPage.tsx`, duplicando el `h1` del topbar — media.
- Icono de orden inactivo con opacidad 0.35 (contraste efectivo 1.60:1), afordancia poco visible — baja.
- Buscador de Docentes no usa el primitivo `Field`, rompiendo el patrón de campo único — baja.
