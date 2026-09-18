import type { Docente } from './docente'

export interface Curso {
  id: number
  nombre: string
  descripcion: string
  duracionSemanas: number
  precio: number
  /** ISO local sin zona (`YYYY-MM-DDTHH:mm`), tal como lo emite `datetime-local`. */
  fechaInicio: string
  docenteId: number
}

/** Respuesta de `_expand=docente`: evita una consulta por fila al pintar la tabla. */
export type CursoConDocente = Curso & { docente?: Docente }

export type CursoCreatePayload = Omit<Curso, 'id'>
export type CursoUpdatePayload = CursoCreatePayload

export type CursoSortField = 'nombre' | 'precio' | 'fechaInicio' | 'duracionSemanas'

export interface CursoFilters {
  q?: string
  docenteId?: number
  precioMin?: number
  precioMax?: number
  fechaDesde?: string
  fechaHasta?: string
  duracionMin?: number
  duracionMax?: number
  sort?: CursoSortField
  order?: 'asc' | 'desc'
  page?: number
  limit?: number
}
