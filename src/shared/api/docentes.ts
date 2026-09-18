/**
 * Endpoints de `docentes`. Objeto plano sobre `request`/`requestPaged`: sin lógica
 * de dominio. Las comprobaciones de unicidad consultan siempre al backend (spec
 * §6: "no se confía en el estado local"), nunca comparan contra la lista en memoria.
 */
import { request, requestPaged, query, type Paged } from './client'
import type { Docente, DocenteCreatePayload, DocenteFilters, DocenteUpdatePayload } from '../types'

export const docentesApi = {
  list(filters: DocenteFilters): Promise<Paged<Docente>> {
    return requestPaged<Docente>(`/docentes${query({ q: filters.q })}`)
  },

  get(id: number): Promise<Docente> {
    return request<Docente>(`/docentes/${id}`)
  },

  create(payload: DocenteCreatePayload): Promise<Docente> {
    return request<Docente>('/docentes', { method: 'POST', body: JSON.stringify(payload) })
  },

  update(id: number, payload: DocenteUpdatePayload): Promise<Docente> {
    return request<Docente>(`/docentes/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  },

  remove(id: number): Promise<void> {
    return request<void>(`/docentes/${id}`, { method: 'DELETE' })
  },

  /**
   * `excludeId` se pasa al editar: el propio registro no debe contar como
   * duplicado de sí mismo.
   */
  async existsByDocumento(documento: string, excludeId?: number): Promise<boolean> {
    const { items } = await requestPaged<Docente>(`/docentes${query({ documento })}`)
    return items.some((docente) => docente.id !== excludeId)
  },

  async existsByCorreo(correo: string, excludeId?: number): Promise<boolean> {
    const { items } = await requestPaged<Docente>(`/docentes${query({ correo })}`)
    return items.some((docente) => docente.id !== excludeId)
  },
}
