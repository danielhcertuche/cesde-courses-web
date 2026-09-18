/**
 * Endpoints de `cursos`. Objeto plano sobre `request`/`requestPaged`: sin lógica
 * de dominio (unicidad, integridad referencial, etc. viven en la capa de hooks).
 */
import { request, requestPaged, query, type Paged } from './client'
import type {
  Curso,
  CursoConDocente,
  CursoCreatePayload,
  CursoFilters,
  CursoUpdatePayload,
} from '../types'

/**
 * Traduce `CursoFilters` (vocabulario de dominio) a los query params exactos de
 * json-server descritos en la spec §3. `query()` descarta los vacíos, así que no
 * hay que filtrar aquí: basta con mapear uno a uno.
 */
function toListParams(filters: CursoFilters): Record<string, string | number | undefined> {
  return {
    q: filters.q,
    docenteId: filters.docenteId,
    precio_gte: filters.precioMin,
    precio_lte: filters.precioMax,
    fechaInicio_gte: filters.fechaDesde,
    fechaInicio_lte: filters.fechaHasta,
    duracionSemanas_gte: filters.duracionMin,
    duracionSemanas_lte: filters.duracionMax,
    _sort: filters.sort,
    _order: filters.order,
    _page: filters.page,
    _limit: filters.limit,
    // Evita el N+1 al pintar la tabla: el docente viene resuelto en la misma respuesta.
    _expand: 'docente',
  }
}

export const cursosApi = {
  list(filters: CursoFilters): Promise<Paged<CursoConDocente>> {
    return requestPaged<CursoConDocente>(`/cursos${query(toListParams(filters))}`)
  },

  get(id: number): Promise<Curso> {
    return request<Curso>(`/cursos/${id}`)
  },

  create(payload: CursoCreatePayload): Promise<Curso> {
    return request<Curso>('/cursos', { method: 'POST', body: JSON.stringify(payload) })
  },

  update(id: number, payload: CursoUpdatePayload): Promise<Curso> {
    return request<Curso>(`/cursos/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  },

  remove(id: number): Promise<void> {
    return request<void>(`/cursos/${id}`, { method: 'DELETE' })
  },
}
