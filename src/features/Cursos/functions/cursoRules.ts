/**
 * Reglas de negocio de Cursos que no dependen de React: traducción de filtros
 * hacia/desde la URL (spec §3) y la comprobación de unicidad del nombre de
 * curso que usa el formulario. Vive fuera de los componentes para poder
 * probarse sin montar nada.
 */
import { cursosApi } from '@/shared/api/cursos'
import type { CursoFilters } from '@/shared/types'

/** Subconjunto de `CursoFilters` que gobierna la barra de filtros (sin orden ni paginación). */
export type CursosFiltrosBusqueda = Omit<CursoFilters, 'sort' | 'order' | 'page' | 'limit'>

export const FILTROS_VACIOS: CursosFiltrosBusqueda = {}

const CAMPOS_TEXTO: ReadonlyArray<'q' | 'fechaDesde' | 'fechaHasta'> = ['q', 'fechaDesde', 'fechaHasta']

const CAMPOS_NUMERICOS: ReadonlyArray<
  'docenteId' | 'precioMin' | 'precioMax' | 'duracionMin' | 'duracionMax'
> = ['docenteId', 'precioMin', 'precioMax', 'duracionMin', 'duracionMax']

function numeroDesdeParam(valor: string | null): number | undefined {
  if (valor === null || valor === '') return undefined
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : undefined
}

/** Lee el estado de filtros directamente desde `URLSearchParams` (enlazable, spec §3). */
export function filtrosDesdeUrl(params: URLSearchParams): CursosFiltrosBusqueda {
  const filtros: CursosFiltrosBusqueda = {}
  for (const campo of CAMPOS_TEXTO) {
    const valor = params.get(campo)
    if (valor) filtros[campo] = valor
  }
  for (const campo of CAMPOS_NUMERICOS) {
    const valor = numeroDesdeParam(params.get(campo))
    if (valor !== undefined) filtros[campo] = valor
  }
  return filtros
}

/** Serializa el estado de filtros a `URLSearchParams`, descartando los vacíos. */
export function urlDesdeFiltros(filtros: CursosFiltrosBusqueda): URLSearchParams {
  const params = new URLSearchParams()
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor === undefined || valor === null || valor === '') continue
    if (typeof valor === 'number' && Number.isNaN(valor)) continue
    params.set(clave, String(valor))
  }
  return params
}

/**
 * Cuenta por grupo (uno por cada fila de la tabla de la spec §3), no por
 * campo: un rango con sus dos extremos llenos sigue contando como un único
 * filtro activo.
 */
export function contarFiltrosActivos(filtros: CursosFiltrosBusqueda): number {
  const grupos = [
    Boolean(filtros.q?.trim()),
    filtros.docenteId !== undefined,
    filtros.precioMin !== undefined || filtros.precioMax !== undefined,
    filtros.fechaDesde !== undefined || filtros.fechaHasta !== undefined,
    filtros.duracionMin !== undefined || filtros.duracionMax !== undefined,
  ]
  return grupos.filter(Boolean).length
}

/**
 * Compara dos estados de filtros por contenido. Se usa para distinguir un
 * cambio que viene de fuera (URL) de uno que el propio componente acaba de
 * despachar, sin arrastrar una librería de igualdad profunda para ocho campos.
 */
export function filtrosIguales(a: CursosFiltrosBusqueda, b: CursosFiltrosBusqueda): boolean {
  const claves = new Set([...Object.keys(a), ...Object.keys(b)]) as Set<keyof CursosFiltrosBusqueda>
  for (const clave of claves) {
    if (a[clave] !== b[clave]) return false
  }
  return true
}

/**
 * Adapta el filtro de fecha "hasta" para que incluya el día completo.
 * json-server compara `fechaInicio_lte` como string: una fecha sin hora
 * ("2026-02-09") es lexicográficamente menor que cualquier hora de ese mismo
 * día ("2026-02-09T18:00:00"), así que un curso que arranca esa tarde
 * quedaría fuera del filtro si se envía la fecha pura. El ajuste vive sólo
 * aquí, en el borde hacia la API: la URL y el input de fecha siguen
 * mostrando `YYYY-MM-DD` sin hora.
 */
export function filtrosParaApi(filtros: CursosFiltrosBusqueda): CursosFiltrosBusqueda {
  if (!filtros.fechaHasta) return filtros
  return { ...filtros, fechaHasta: `${filtros.fechaHasta}T23:59:59` }
}

/**
 * Unicidad de `nombre` (case-insensitive, sin espacios en los extremos).
 * A diferencia de `docentesApi`, `cursosApi` no expone un helper de
 * disponibilidad: json-server no da un filtro de texto exacto, sólo `q`
 * (subcadena, sobre todos los campos). Se listan los candidatos con `q` y se
 * compara en memoria contra el valor normalizado, excluyendo el propio
 * registro cuando se edita.
 */
export async function nombreCursoDisponible(nombre: string, idEnEdicion?: number): Promise<boolean> {
  const normalizado = nombre.trim().toLowerCase()
  if (!normalizado) return true
  const { items } = await cursosApi.list({ q: nombre.trim() })
  return !items.some(
    (curso) => curso.id !== idEnEdicion && curso.nombre.trim().toLowerCase() === normalizado,
  )
}
