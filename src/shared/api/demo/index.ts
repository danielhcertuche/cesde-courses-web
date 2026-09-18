/**
 * Punto de entrada del backend simulado. `client.ts` lo importa dinámicamente
 * (`import('./demo')`) sólo cuando `VITE_API_MODE === 'demo'`, así este
 * código (y el `db.json` que arrastra `seed.ts`) no entra en el bundle de
 * desarrollo ni en un despliegue que no lo pida.
 */
import { ApiError } from '../apiError'
import type { Paged } from '../client'
import { dispatchDemoRequest } from './router'

export { resetDemoData } from './store'

/** Mismo mensaje de respaldo que usa `parseError` en `client.ts` para una respuesta real fallida. */
function fallbackMessage(status: number): string {
  return status === 404 ? 'El recurso no existe.' : 'No fue posible completar la operación.'
}

export async function demoRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = dispatchDemoRequest(path, init)
  if (response.status >= 400) throw new ApiError(response.status, fallbackMessage(response.status))
  return response.body as T
}

export async function demoRequestPaged<T>(path: string): Promise<Paged<T>> {
  const response = dispatchDemoRequest(path)
  if (response.status >= 400) throw new ApiError(response.status, fallbackMessage(response.status))
  return { items: response.body as T[], total: response.total }
}
