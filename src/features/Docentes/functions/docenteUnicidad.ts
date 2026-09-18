/**
 * Wiring de la unicidad asíncrona de `documento` y `correo` (spec §6: "se
 * consulta al backend antes de guardar, no se confía en el estado local")
 * para `DocenteFormModal`. `docentesApi.existsByDocumento/existsByCorreo`
 * ya admiten `excludeId` para que, al editar, el propio registro no cuente
 * como duplicado de sí mismo; aquí sólo se invierte el sentido booleano
 * ("existe" -> "no disponible") para encajar con `crearReglaUnica`, que
 * espera una función `estaDisponible`.
 */
import { docentesApi } from '@/shared/api/docentes'
import { crearReglaUnica, type ReglaAsync } from '@/shared/validation'

export interface ReglasUnicidadDocente {
  documento: ReglaAsync<string>
  correo: ReglaAsync<string>
}

export function crearReglasUnicidadDocente(excludeId?: number): ReglasUnicidadDocente {
  return {
    documento: crearReglaUnica<string>(
      async (documento) => !(await docentesApi.existsByDocumento(documento, excludeId)),
      'Ya existe un docente con este documento.',
    ),
    correo: crearReglaUnica<string>(
      async (correo) => !(await docentesApi.existsByCorreo(correo, excludeId)),
      'Ya existe un docente con este correo.',
    ),
  }
}
