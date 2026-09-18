/**
 * Reglas de validación declarativas y componibles.
 *
 * Cada regla es una función pura: valor -> mensaje de error en español, o `null` si el valor
 * es válido. `componer` las encadena en un campo y `crearValidador` convierte un esquema
 * completo (un campo -> una regla) en la función que consume `useForm`.
 *
 * La unicidad (nombre de curso, documento, correo) no vive aquí: exige una llamada al backend,
 * y este módulo no importa el cliente HTTP para no acoplar validación con transporte. Se resuelve
 * con `crearReglaUnica`, que envuelve la comprobación remota que la feature ya tiene (a través de
 * `shared/api`) como una regla asíncrona que `useForm` ejecuta en blur y de nuevo en submit.
 */

import type { CursoCreatePayload, DocenteCreatePayload } from '@/shared/types'

export type Regla<V> = (valor: V) => string | null
export type ReglaAsync<V> = (valor: V) => Promise<string | null>

/** Esquema de un formulario: una regla compuesta por campo, evaluada en orden. */
export type Esquema<T> = { [K in keyof T]?: Regla<T[K]> }

/**
 * Encadena reglas y devuelve el primer error que aparezca. Acepta reglas condicionales
 * (`false`/`null`/`undefined`) para casos como "fechaFutura sólo aplica al crear", sin que
 * el llamador tenga que ramificar fuera de la composición.
 */
export function componer<V>(...reglas: Array<Regla<V> | false | null | undefined>): Regla<V> {
  return (valor) => {
    for (const regla of reglas) {
      if (!regla) continue
      const error = regla(valor)
      if (error) return error
    }
    return null
  }
}

/** Convierte un esquema de reglas por campo en la función de validación que usa `useForm`. */
export function crearValidador<T extends Record<string, unknown>>(
  esquema: Esquema<T>,
): (valores: T) => Partial<Record<keyof T, string>> {
  return (valores) => {
    const errores: Partial<Record<keyof T, string>> = {}
    for (const campo of Object.keys(esquema) as Array<keyof T>) {
      const regla = esquema[campo]
      if (!regla) continue
      const error = regla(valores[campo])
      if (error) errores[campo] = error
    }
    return errores
  }
}

/**
 * Un campo "vacío" no dispara las reglas de forma (longitud, rango, patrón, etc.): esa
 * responsabilidad es de `requerido`. Así cada regla se puede usar sola en un campo opcional
 * sin heredar un mensaje de "obligatorio" que no le corresponde.
 */
function estaVacio(valor: unknown): boolean {
  if (valor === null || valor === undefined) return true
  if (typeof valor === 'string') return valor.trim().length === 0
  if (typeof valor === 'number') return Number.isNaN(valor)
  return false
}

export function requerido(mensaje = 'Este campo es obligatorio.'): Regla<unknown> {
  return (valor) => (estaVacio(valor) ? mensaje : null)
}

export function longitud(min: number, max: number): Regla<string | null | undefined> {
  return (valor) => {
    if (estaVacio(valor)) return null
    const texto = (valor as string).trim()
    if (texto.length < min) return `Debe tener al menos ${min} caracteres.`
    if (texto.length > max) return `Debe tener como máximo ${max} caracteres.`
    return null
  }
}

export function rango(min: number, max: number): Regla<number | null | undefined> {
  return (valor) => {
    if (estaVacio(valor)) return null
    const numero = valor as number
    if (numero < min) return `Debe ser mayor o igual a ${min}.`
    if (numero > max) return `Debe ser menor o igual a ${max}.`
    return null
  }
}

export function entero(mensaje = 'Debe ser un número entero.'): Regla<number | null | undefined> {
  return (valor) => {
    if (estaVacio(valor)) return null
    return Number.isInteger(valor as number) ? null : mensaje
  }
}

export function decimal(posiciones: number): Regla<number | null | undefined> {
  return (valor) => {
    if (estaVacio(valor)) return null
    const numero = valor as number
    if (!Number.isFinite(numero)) return 'Debe ser un número válido.'
    const parteDecimal = numero.toString().split('.')[1] ?? ''
    if (parteDecimal.length > posiciones) return `Debe tener máximo ${posiciones} decimales.`
    return null
  }
}

export function patron(regex: RegExp, mensaje: string): Regla<string | null | undefined> {
  return (valor) => {
    if (estaVacio(valor)) return null
    return regex.test(valor as string) ? null : mensaje
  }
}

const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function correo(
  mensaje = 'Ingresa un correo electrónico válido.',
): Regla<string | null | undefined> {
  return patron(PATRON_CORREO, mensaje)
}

/** Sólo valida el formato del string (`YYYY-MM-DDTHH:mm`), sin exigir que sea futura. */
export function fecha(
  mensaje = 'Ingresa una fecha y hora válidas.',
): Regla<string | null | undefined> {
  return (valor) => {
    if (estaVacio(valor)) return null
    return Number.isNaN(new Date(valor as string).getTime()) ? mensaje : null
  }
}

/**
 * `fechaInicio` viaja como ISO local sin zona; se interpreta con `new Date(valor)` únicamente
 * aquí, en el borde de validación, y sólo para comparar contra el reloj del navegador. El valor
 * en sí nunca se convierte a `Date` antes de esto ni después: sigue siendo string en todo el
 * resto de la aplicación.
 */
export function fechaFutura(
  mensaje = 'La fecha debe ser posterior al momento actual.',
): Regla<string | null | undefined> {
  return (valor) => {
    if (estaVacio(valor)) return null
    const momento = new Date(valor as string)
    if (Number.isNaN(momento.getTime())) return 'Ingresa una fecha y hora válidas.'
    return momento.getTime() > Date.now() ? null : mensaje
  }
}

export function soloLetras(
  mensaje = 'Sólo se permiten letras y espacios.',
): Regla<string | null | undefined> {
  return patron(/^[\p{L}\s]+$/u, mensaje)
}

/** Pertenencia a un conjunto ya cargado en memoria (p. ej. IDs de docentes del select). */
export function perteneceA<V extends string | number>(
  opciones: readonly V[],
  mensaje = 'Selecciona una opción válida.',
): Regla<V | null | undefined> {
  return (valor) => {
    if (estaVacio(valor)) return null
    return opciones.includes(valor as V) ? null : mensaje
  }
}

/**
 * Envuelve una comprobación remota (unicidad de nombre, documento o correo) como regla
 * asíncrona. `useForm` la ejecuta en blur y la repite en submit; nunca en cada tecla, para no
 * saturar el backend mientras el usuario escribe.
 */
export function crearReglaUnica<V>(
  estaDisponible: (valor: V) => Promise<boolean>,
  mensaje = 'Ya existe un registro con este valor.',
): ReglaAsync<V> {
  return async (valor) => {
    if (estaVacio(valor)) return null
    const disponible = await estaDisponible(valor)
    return disponible ? null : mensaje
  }
}

export interface OpcionesReglasCurso {
  /** IDs de docentes existentes, cargados junto al select del formulario. */
  docentesValidos: readonly number[]
  /** Al crear, `fechaInicio` debe ser futura; al editar se admite una fecha ya pasada. */
  modo: 'crear' | 'editar'
}

/**
 * Composición lista para `CursoFormModal`. Cubre la tabla "Curso" de la spec §6, salvo la
 * unicidad de `nombre` (async, se agrega en el `validarAsync` del `useForm` con
 * `crearReglaUnica` + la consulta a `shared/api/cursos`).
 */
export function reglasCurso(opciones: OpcionesReglasCurso): Esquema<CursoCreatePayload> {
  return {
    nombre: componer(requerido(), longitud(3, 80)),
    descripcion: componer(requerido(), longitud(10, 500)),
    duracionSemanas: componer(requerido(), entero(), rango(1, 104)),
    precio: componer(requerido(), rango(0, Number.MAX_SAFE_INTEGER), decimal(2)),
    fechaInicio: componer(
      requerido('La fecha de inicio es obligatoria.'),
      fecha(),
      opciones.modo === 'crear' ? fechaFutura() : null,
    ),
    docenteId: componer(
      requerido('Selecciona un docente.'),
      perteneceA(opciones.docentesValidos, 'El docente seleccionado no existe.'),
    ),
  }
}

/**
 * Composición lista para `DocenteFormModal`. Cubre la tabla "Docente" de la spec §6, salvo la
 * unicidad de `documento` y `correo` (async, mismo patrón que en `reglasCurso`).
 */
export function reglasDocente(): Esquema<DocenteCreatePayload> {
  return {
    nombre: componer(requerido(), longitud(3, 80), soloLetras()),
    documento: componer(
      requerido(),
      patron(/^\d{6,15}$/, 'Debe tener entre 6 y 15 dígitos, sin espacios ni letras.'),
    ),
    correo: componer(requerido(), correo()),
  }
}
