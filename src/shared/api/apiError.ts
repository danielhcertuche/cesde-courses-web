/**
 * Vive fuera de `client.ts` para que el backend simulado (`api/demo/`) pueda
 * lanzar el mismo tipo de error sin crear un ciclo de importación con el
 * módulo que, en modo demo, lo carga a él dinámicamente.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
