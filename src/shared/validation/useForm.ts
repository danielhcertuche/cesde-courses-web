/**
 * Hook de formularios genérico. No conoce `Curso` ni `Docente`: recibe valores iniciales, una
 * función de validación síncrona (normalmente `crearValidador(reglasCurso(...))`) y, por campo,
 * una validación asíncrona opcional para las comprobaciones que exigen backend (unicidad).
 */

import { useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'

type RegistroCampo<T, V> = Partial<Record<keyof T, V>>

export interface OpcionesUseForm<T extends Record<string, unknown>> {
  valoresIniciales: T
  /** Reglas síncronas del formulario completo. Ausente = formulario siempre válido en lo síncrono. */
  validar?: (valores: T) => RegistroCampo<T, string>
  /**
   * Comprobaciones remotas por campo (p. ej. unicidad de documento/correo/nombre). Corren en
   * blur y se repiten en submit: no se confía en un resultado cacheado si el usuario nunca
   * salió del campo o si el valor pudo cambiar entre medio.
   */
  validarAsync?: Partial<{ [K in keyof T]: (valor: T[K], valores: T) => Promise<string | null> }>
  alEnviar: (valores: T) => Promise<void> | void
}

export interface ResultadoUseForm<T extends Record<string, unknown>> {
  valores: T
  /** Sólo incluye campos tocados o posteriores a un intento de envío: nada se muestra antes de eso. */
  errores: RegistroCampo<T, string>
  tocados: RegistroCampo<T, boolean>
  /** Campo con una validación asíncrona en curso. Mientras haya alguno en `true`, no se puede enviar. */
  validando: RegistroCampo<T, boolean>
  enviando: boolean
  /** Validez real del formulario (síncrona + async conocida), independiente de qué error se muestra. */
  esValido: boolean
  handleChange: <K extends keyof T>(campo: K, valor: T[K]) => void
  handleBlur: (campo: keyof T) => void
  handleSubmit: (evento?: FormEvent<HTMLFormElement>) => Promise<void>
  reset: (valoresSiguientes?: T) => void
  setValores: (valoresSiguientes: T | ((anterior: T) => T)) => void
}

function omitirCampo<T extends Record<string, unknown>, V>(
  registro: RegistroCampo<T, V>,
  campo: keyof T,
): RegistroCampo<T, V> {
  if (!(campo in registro)) return registro
  const copia = { ...registro }
  delete copia[campo]
  return copia
}

function marcarTodos<T extends Record<string, unknown>>(valores: T): RegistroCampo<T, boolean> {
  const resultado: RegistroCampo<T, boolean> = {}
  for (const campo of Object.keys(valores) as Array<keyof T>) resultado[campo] = true
  return resultado
}

function hayAlgunError<T extends Record<string, unknown>>(registro: RegistroCampo<T, string>): boolean {
  return Object.values(registro).some((mensaje) => Boolean(mensaje))
}

export function useForm<T extends Record<string, unknown>>(
  opciones: OpcionesUseForm<T>,
): ResultadoUseForm<T> {
  const { valoresIniciales, validar, validarAsync, alEnviar } = opciones

  const [valores, setValoresState] = useState<T>(valoresIniciales)
  const [erroresSync, setErroresSync] = useState<RegistroCampo<T, string>>({})
  const [erroresAsync, setErroresAsync] = useState<RegistroCampo<T, string>>({})
  const [tocados, setTocados] = useState<RegistroCampo<T, boolean>>({})
  const [validando, setValidando] = useState<RegistroCampo<T, boolean>>({})
  const [enviando, setEnviando] = useState(false)
  const [intentoEnvio, setIntentoEnvio] = useState(false)

  // Descarta un resultado async que llega tarde, después de que el campo ya cambió de nuevo.
  const tokensAsync = useRef<RegistroCampo<T, number>>({})

  function setValores(valoresSiguientes: T | ((anterior: T) => T)): void {
    setValoresState(valoresSiguientes)
  }

  function reset(valoresSiguientes: T = valoresIniciales): void {
    setValoresState(valoresSiguientes)
    setErroresSync({})
    setErroresAsync({})
    setTocados({})
    setValidando({})
    setIntentoEnvio(false)
  }

  function ejecutarAsync<K extends keyof T>(
    campo: K,
    validador: (valor: T[K], valores: T) => Promise<string | null>,
    valoresActuales: T,
  ): Promise<string | null> {
    const token = (tokensAsync.current[campo] ?? 0) + 1
    tokensAsync.current[campo] = token
    setValidando((anterior) => ({ ...anterior, [campo]: true }))

    return validador(valoresActuales[campo], valoresActuales)
      .catch(() => 'No fue posible validar este campo. Intenta de nuevo.')
      .then((mensaje) => {
        if (tokensAsync.current[campo] !== token) return null
        setErroresAsync((anterior) => ({ ...anterior, [campo]: mensaje ?? undefined }))
        setValidando((anterior) => ({ ...anterior, [campo]: false }))
        return mensaje
      })
  }

  function handleChange<K extends keyof T>(campo: K, valor: T[K]): void {
    const valoresSiguientes = { ...valores, [campo]: valor }
    setValoresState(valoresSiguientes)

    // El valor cambió: el resultado async previo (p. ej. unicidad) ya no aplica a este campo.
    setErroresAsync((anterior) => omitirCampo(anterior, campo))

    // Sólo se revalida en vivo un campo que ya era visible (tocado o tras un intento de envío);
    // el resto respeta "no muestra error hasta que se toca o se intenta enviar".
    if (tocados[campo] || intentoEnvio) {
      const erroresVivos: RegistroCampo<T, string> = validar ? validar(valoresSiguientes) : {}
      setErroresSync((anterior) => ({ ...anterior, [campo]: erroresVivos[campo] }))
    }
  }

  function handleBlur(campo: keyof T): void {
    setTocados((anterior) => ({ ...anterior, [campo]: true }))

    const erroresVivos: RegistroCampo<T, string> = validar ? validar(valores) : {}
    const errorSync = erroresVivos[campo]
    setErroresSync((anterior) => ({ ...anterior, [campo]: errorSync }))

    const validador = validarAsync?.[campo]
    if (errorSync || !validador) return
    void ejecutarAsync(campo, validador, valores)
  }

  async function handleSubmit(evento?: FormEvent<HTMLFormElement>): Promise<void> {
    evento?.preventDefault()
    setIntentoEnvio(true)
    setTocados(marcarTodos(valores))

    const erroresVivos: RegistroCampo<T, string> = validar ? validar(valores) : {}
    setErroresSync(erroresVivos)
    if (hayAlgunError(erroresVivos)) return

    if (validarAsync) {
      const campos = Object.keys(validarAsync) as Array<keyof T>
      const resultados = await Promise.all(
        campos.map(async (campo) => {
          const validador = validarAsync[campo]
          if (!validador) return null
          return ejecutarAsync(campo, validador, valores)
        }),
      )
      if (resultados.some((mensaje) => Boolean(mensaje))) return
    }

    setEnviando(true)
    try {
      await alEnviar(valores)
    } finally {
      setEnviando(false)
    }
  }

  const esValido = useMemo(() => {
    const erroresVivos: RegistroCampo<T, string> = validar ? validar(valores) : {}
    if (hayAlgunError(erroresVivos)) return false
    if (hayAlgunError(erroresAsync)) return false
    if (Object.values(validando).some(Boolean)) return false
    return !enviando
  }, [valores, validar, erroresAsync, validando, enviando])

  const errores = useMemo(() => {
    const visibles: RegistroCampo<T, string> = {}
    for (const campo of Object.keys(valores) as Array<keyof T>) {
      if (!tocados[campo] && !intentoEnvio) continue
      const mensaje = erroresAsync[campo] ?? erroresSync[campo]
      if (mensaje) visibles[campo] = mensaje
    }
    return visibles
  }, [valores, tocados, intentoEnvio, erroresAsync, erroresSync])

  return {
    valores,
    errores,
    tocados,
    validando,
    enviando,
    esValido,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValores,
  }
}
