# cesde-courses-web

Aplicación web de administración de cursos y docentes de Cesde: SPA sobre una API REST simulada.

## Stack

| Capa | Tecnología | Versión |
|---|---|---|
| UI | React | 19.2 |
| Lenguaje | TypeScript (`strict`) | 5.7 |
| Build | Vite | 6 |
| Ruteo | react-router-dom | 7.9 |
| API simulada | json-server | 0.17.4 (pin exacto) |

No se usa ninguna librería de componentes, de iconos, de formularios ni de manejo de estado: la
interfaz (`src/ui/`), la validación (`src/shared/validation/`), los iconos SVG (`src/ui/icons/`) y
el acceso a datos (`src/shared/api/` + hooks propios) son código propio del repositorio. 

## Requisitos previos

Node 22 y npm.

## Instalación y ejecución

```
npm install
npm run dev
```

`npm run dev` levanta la API simulada (json-server) en `http://localhost:3001` y la aplicación
(Vite) en `http://localhost:5173` con un solo comando; la SPA llama a `/api` y Vite reenvía esa
ruta a json-server, así que en desarrollo no hay CORS ni URLs base distintas por entorno.

| Script | Qué hace |
|---|---|
| `npm run build` | Chequea tipos (`tsc --noEmit`) y genera el build de producción con Vite |
| `npm run typecheck` | Sólo chequeo de tipos, sin emitir |
| `npm run lint` | ESLint sobre `src`, cero warnings tolerados |

## Funcionamiento

Un administrador tiene CRUD completo de cursos y de docentes, con confirmación explícita antes de
eliminar. Dos reglas de integridad se aplican en todo momento: no es posible eliminar un docente
que tenga cursos asociados (la acción se bloquea y se indica cuántos cursos tiene, para que se
reasignen antes de reintentar), y los nombres de curso, los documentos de docente y los correos de
docente son únicos.

El acceso a `/cursos` y `/docentes` exige una sesión demostrativa (usuario `admin`, contraseña
`cesde2026`, visibles en la propia pantalla de acceso): sirve para mostrar comunicación entre
componentes y rutas protegidas, no reemplaza una autenticación real, ya que la credencial se
compara en el navegador y no existe backend que la valide.

## Filtros de búsqueda

El listado de cursos combina cinco filtros. El estado vive en la URL (`useSearchParams`), de modo
que una búsqueda es enlazable y sobrevive al refresco de la página.

| Filtro | Control | Parámetro de URL |
|---|---|---|
| Texto en nombre o descripción | input de búsqueda, debounce 300 ms | `q` |
| Docente | select alimentado de `/docentes` | `docenteId` |
| Rango de precio | dos inputs numéricos | `precioMin` / `precioMax` |
| Rango de fecha de inicio | dos inputs de fecha | `fechaDesde` / `fechaHasta` |
| Duración en semanas | dos inputs numéricos | `duracionMin` / `duracionMax` |

## Validación de formularios

Se valida en `onBlur` y en `submit`; el mensaje aparece bajo el campo y el botón de envío queda
deshabilitado mientras el formulario es inválido.

**Curso**

| Campo | Reglas |
|---|---|
| nombre | requerido, 3–80 caracteres, único entre cursos (case-insensitive) |
| descripcion | requerido, 10–500 caracteres |
| duracionSemanas | requerido, entero, 1–104 |
| precio | requerido, ≥ 0, máximo 2 decimales |
| fechaInicio | requerido, fecha y hora válidas; al crear debe ser futura, al editar se admite pasada |
| docenteId | requerido, debe existir entre los docentes cargados |

**Docente**

| Campo | Reglas |
|---|---|
| nombre | requerido, 3–80 caracteres, sólo letras y espacios |
| documento | requerido, 6–15 dígitos, único |
| correo | requerido, formato de correo válido, único |

La unicidad de nombre de curso, documento y correo se comprueba contra el backend en cada
verificación, nunca contra el estado local del formulario.

## Diseño responsive

Breakpoints en 640px y 1024px. Sobre 1024px: navegación lateral fija y tabla completa. Entre 640
y 1024px: navegación colapsada a iconos y la tabla oculta columnas secundarias. Bajo 640px: la
tabla se reemplaza por tarjetas, los filtros colapsan tras un botón y el modal ocupa la pantalla
completa.

## Estructura del proyecto

```
src/
├── app/        enrutamiento (routes.tsx) y layout raíz (AppShell)
├── features/   Cursos y Docentes: página, componentes, hooks y reglas de negocio propias de cada dominio
├── shared/     tipos, cliente HTTP y API por dominio, validación, formateo — reutilizable entre features
├── styles/     tokens de diseño y estilos base
└── ui/         primitivas visuales propias (Button, Input, Select, Table, Modal, icons, etc.)
```

Tres reglas de dependencia: una feature nunca importa de otra feature (lo común sube a `shared/`);
sólo `ui/` y `styles/` definen estilo visual; y ningún componente importa el cliente HTTP
directamente — el acceso a red va de `client` a `api/<dominio>` a un hook, y el componente sólo
consume el hook.

## API simulada

json-server expone `GET/POST /docentes`, `GET/PUT/DELETE /docentes/:id`, `GET/POST /cursos` y
`GET/PUT/DELETE /cursos/:id` a partir de `db.json`, con soporte de query params (`q`,
filtros `_gte`/`_lte`, `_sort`/`_order`, `_page`/`_limit`, `_expand`). El archivo `db.json`
se modifica en disco a medida que se usa la aplicación (crear, editar y eliminar escriben sobre
ese archivo).

## Despliegue

El sitio se publica en GitHub Pages en cada empuje a `main`
(`.github/workflows/pages.yml`): el workflow verifica tipos y estilo, construye y
empuja `dist/` a la rama `gh-pages`.

**https://danielhcertuche.github.io/cesde-courses-web/**

La demo publicada no tiene servidor propio: construye con `VITE_API_MODE=demo`, que
activa un backend simulado en el navegador (`src/shared/api/demo/`). Se siembra con
el mismo `db.json` del repositorio y persiste cada cambio en el `localStorage` de
cada visitante, así que **crear, editar y eliminar funcionan de verdad y sobreviven
al refresco**. Los datos son privados de cada navegador — no se comparten entre
visitantes ni vuelven al servidor — y un aviso permanente en la interfaz (sólo
visible en modo demo) permite restablecerlos al estado original en cualquier
momento. El backend real del proyecto sigue siendo json-server: `npm run dev` lo
levanta igual que siempre y es el único lugar donde `db.json` se escribe en disco.

Dos detalles del despliegue que no son evidentes: Vite construye con `base`
`/cesde-courses-web/` porque Pages sirve el sitio bajo el nombre del repositorio, y
el workflow copia `index.html` como `404.html` porque Pages no reescribe rutas y,
sin eso, recargar en `/cursos` daría un 404.

