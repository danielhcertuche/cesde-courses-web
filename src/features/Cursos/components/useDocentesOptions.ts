/**
 * Lista de docentes para alimentar el select de filtro y el del formulario de
 * curso. No vive en `Cursos/hooks/` (cerrada para esta vía) ni se importa de
 * `features/Docentes` (R1: una feature nunca importa de otra): se resuelve
 * con el mismo `useResource` genérico que ya usa `useCursos`, apuntando a
 * `docentesApi` directamente desde aquí.
 */
import { useResource } from '@/shared/hooks/useResource'
import { docentesApi } from '@/shared/api/docentes'
import type { Docente, DocenteFilters } from '@/shared/types'

// Mensajes exigidos por la forma de `useResource` pero nunca disparados: este
// hook sólo lista docentes para poblar selects, no crea/edita/elimina.
const MESSAGES = { createSuccess: '', updateSuccess: '', removeSuccess: '' }

const SIN_FILTROS: DocenteFilters = {}

export interface UseDocentesOptionsResult {
  docentes: Docente[]
  loading: boolean
}

export function useDocentesOptions(): UseDocentesOptionsResult {
  const { items, loading } = useResource(docentesApi, SIN_FILTROS, MESSAGES)
  return { docentes: items, loading }
}
