/**
 * Único punto de salida HTTP de la aplicación.
 * Ningún componente lo importa: el acceso va client -> api/<dominio> -> hook -> componente.
 */

const BASE_URL = '/api'

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface Paged<T> {
  items: T[]
  total: number
}

type QueryValue = string | number | boolean | null | undefined

/**
 * Serializa filtros descartando los vacíos. Un parámetro sin valor no debe llegar
 * a la URL: json-server lo interpretaría como "campo igual a cadena vacía" y
 * devolvería cero resultados en lugar de ignorarlo.
 */
export function query(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.append(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string }
    if (body.message) return body.message
  } catch {
    /* respuesta sin cuerpo JSON */
  }
  return response.status === 404 ? 'El recurso no existe.' : 'No fue posible completar la operación.'
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    // fetch sólo rechaza por fallo de red: el servidor de datos no está arriba.
    throw new ApiError(0, 'No hay conexión con el servidor de datos.')
  }

  if (!response.ok) throw new ApiError(response.status, await parseError(response))
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/** Variante de lectura que además expone el total de la cabecera de paginación. */
export async function requestPaged<T>(path: string): Promise<Paged<T>> {
  const response = await fetch(`${BASE_URL}${path}`)
  if (!response.ok) throw new ApiError(response.status, await parseError(response))

  const items = (await response.json()) as T[]
  const header = response.headers.get('X-Total-Count')
  return { items, total: header ? Number(header) : items.length }
}
