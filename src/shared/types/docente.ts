export interface Docente {
  id: number
  nombre: string
  documento: string
  correo: string
}

export type DocenteCreatePayload = Omit<Docente, 'id'>
export type DocenteUpdatePayload = DocenteCreatePayload

export interface DocenteFilters {
  q?: string
}
