import { ApiError } from '@/shared/api/client'
import { cursosApi } from '@/shared/api/cursos'
import { docentesApi } from '@/shared/api/docentes'
import { useResource, type UseResourceResult } from '@/shared/hooks/useResource'
import type { Docente, DocenteCreatePayload, DocenteFilters, DocenteUpdatePayload } from '@/shared/types'

const MESSAGES = {
  createSuccess: 'Docente creado correctamente.',
  updateSuccess: 'Docente actualizado correctamente.',
  removeSuccess: 'Docente eliminado correctamente.',
}

/**
 * json-server no tiene llaves foráneas: la integridad referencial (spec §2 —
 * "al eliminar un docente con cursos asociados la UI bloquea la acción y
 * ofrece reasignar") se valida aquí, antes de llamar al endpoint de borrado.
 * Esta comprobación es lógica de dominio, por eso no vive en `docentesApi`
 * (objeto plano de endpoints) sino en esta capa de hook.
 */
async function removeWithIntegrityCheck(id: number): Promise<void> {
  const { total } = await cursosApi.list({ docenteId: id, limit: 1 })
  if (total > 0) {
    throw new ApiError(
      409,
      'No se puede eliminar: el docente tiene cursos asociados. Reasigna esos cursos antes de eliminarlo.',
    )
  }
  await docentesApi.remove(id)
}

const guardedDocentesApi = { ...docentesApi, remove: removeWithIntegrityCheck }

export type UseDocentesResult = UseResourceResult<Docente, DocenteCreatePayload, DocenteUpdatePayload>

export function useDocentes(filters: DocenteFilters): UseDocentesResult {
  return useResource<Docente, DocenteFilters, DocenteCreatePayload, DocenteUpdatePayload>(
    guardedDocentesApi,
    filters,
    MESSAGES,
  )
}
