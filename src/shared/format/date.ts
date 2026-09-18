/**
 * Puente entre el `fechaInicio` del dominio (ISO local sin zona, precisión de minuto:
 * `YYYY-MM-DDTHH:mm`) y el `value` de `<input type="datetime-local">`, más el formato legible
 * es-CO para la tabla. La capa de transporte nunca ve un `Date`: aquí sólo se recorta o valida
 * el string, salvo en `formatearFechaLegible`, donde un `Date` se construye y se descarta en la
 * misma función, sólo para producir texto.
 */

const PATRON_ISO_LOCAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?$/
const PATRON_FECHA_HORA = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/

/** Recorta segundos/milisegundos, si los hay, al formato de minuto que usa el dominio. */
function normalizarFechaLocal(valor: string): string {
  return PATRON_ISO_LOCAL.test(valor) ? valor.slice(0, 16) : valor
}

/** `fechaInicio` del dominio -> `value` de un input `datetime-local`. */
export function aInputDatetimeLocal(fechaInicio: string): string {
  return normalizarFechaLocal(fechaInicio)
}

/** `value` de un input `datetime-local` -> `fechaInicio` del dominio. */
export function desdeInputDatetimeLocal(valorInput: string): string {
  return normalizarFechaLocal(valorInput)
}

const FORMATEADOR_FECHA_LEGIBLE = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/**
 * Formato legible para la tabla, p. ej. "09 feb 2026, 06:00 p. m.". Los componentes se leen del
 * string con una expresión regular -no con el parser general de `Date`- para no arrastrar una
 * interpretación de zona horaria que el dominio no tiene.
 */
export function formatearFechaLegible(fechaInicio: string): string {
  const coincidencia = PATRON_FECHA_HORA.exec(fechaInicio)
  if (!coincidencia) return fechaInicio

  const anio = Number(coincidencia[1])
  const mes = Number(coincidencia[2])
  const dia = Number(coincidencia[3])
  const horas = Number(coincidencia[4])
  const minutos = Number(coincidencia[5])
  const fechaLocal = new Date(anio, mes - 1, dia, horas, minutos)

  if (Number.isNaN(fechaLocal.getTime())) return fechaInicio
  return FORMATEADOR_FECHA_LEGIBLE.format(fechaLocal)
}
