/**
 * Lectura de apoyo para la UI de borrado (spec §2: "al intentar eliminar un
 * docente con cursos asociados... se dice cuántos cursos tiene"). La regla
 * de bloqueo real ya vive en `useDocentes` (`remove` repite esta misma
 * comprobación antes de ejecutar el `DELETE`); esta función no bloquea nada
 * por sí sola, sólo informa por adelantado para no pedir una confirmación
 * ciega y poder mostrar la cifra que exige la spec. Si esta lectura falla,
 * el flujo de borrado sigue igual: `useDocentes().remove` decide y explica
 * el resultado por su cuenta.
 */
import { cursosApi } from '@/shared/api/cursos'

export async function contarCursosDeDocente(docenteId: number): Promise<number> {
  const { total } = await cursosApi.list({ docenteId, limit: 1 })
  return total
}
