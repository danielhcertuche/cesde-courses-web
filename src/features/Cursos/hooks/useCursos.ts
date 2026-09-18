import { cursosApi } from '@/shared/api/cursos'
import { useResource, type UseResourceResult } from '@/shared/hooks/useResource'
import type { CursoConDocente, CursoCreatePayload, CursoFilters, CursoUpdatePayload } from '@/shared/types'

// Fuera del componente: identidad estable, así las mutaciones memoizadas en
// useResource no se recrean en cada render.
const MESSAGES = {
  createSuccess: 'Curso creado correctamente.',
  updateSuccess: 'Curso actualizado correctamente.',
  removeSuccess: 'Curso eliminado correctamente.',
}

export type UseCursosResult = UseResourceResult<CursoConDocente, CursoCreatePayload, CursoUpdatePayload>

/**
 * Lista de cursos con docente expandido, filtrada según `filters` (sincronizados
 * con la URL por el componente que llama a este hook).
 */
export function useCursos(filters: CursoFilters): UseCursosResult {
  return useResource<CursoConDocente, CursoFilters, CursoCreatePayload, CursoUpdatePayload>(
    cursosApi,
    filters,
    MESSAGES,
  )
}
