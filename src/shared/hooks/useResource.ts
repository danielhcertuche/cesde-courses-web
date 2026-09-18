/**
 * Ciclo list/create/update/delete + invalidación, compartido por los dos
 * dominios (cursos, docentes). El aviso de éxito/error se dispara aquí, no en
 * el componente, para que ninguna pantalla pueda olvidarlo.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, type Paged } from '../api/client'
import { useToast } from '@/ui'

export interface ResourceApi<TItem, TFilters, TCreate, TUpdate> {
  list: (filters: TFilters) => Promise<Paged<TItem>>
  create: (payload: TCreate) => Promise<TItem>
  update: (id: number, payload: TUpdate) => Promise<TItem>
  remove: (id: number) => Promise<void>
}

export interface ResourceMessages {
  createSuccess: string
  updateSuccess: string
  removeSuccess: string
}

export interface UseResourceResult<TItem, TCreate, TUpdate> {
  items: TItem[]
  total: number
  loading: boolean
  error: string | null
  refetch: () => void
  create: (payload: TCreate) => Promise<TItem | null>
  update: (id: number, payload: TUpdate) => Promise<TItem | null>
  remove: (id: number) => Promise<boolean>
}

function messageOf(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback
}

export function useResource<TItem, TFilters, TCreate, TUpdate>(
  api: ResourceApi<TItem, TFilters, TCreate, TUpdate>,
  filters: TFilters,
  messages: ResourceMessages,
): UseResourceResult<TItem, TCreate, TUpdate> {
  const toast = useToast()
  const [items, setItems] = useState<TItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  // `requestPaged` no admite `AbortSignal` (client.ts no lo expone): la petición
  // en vuelo no se cancela a nivel de red, pero su resultado se descarta si ya
  // no es la última pedida. Evita que una respuesta lenta pise a una más nueva
  // cuando los filtros cambian rápido.
  const latestRequestId = useRef(0)

  // Comparamos por contenido, no por identidad: el caller suele construir el
  // objeto de filtros en cada render y una comparación por referencia dispararía
  // una recarga en cada pintada aunque nada haya cambiado.
  const filtersKey = JSON.stringify(filters)

  const load = useCallback(() => {
    const requestId = ++latestRequestId.current
    setLoading(true)
    setError(null)
    api
      .list(filters)
      .then((paged) => {
        if (requestId !== latestRequestId.current) return
        setItems(paged.items)
        setTotal(paged.total)
      })
      .catch((err: unknown) => {
        if (requestId !== latestRequestId.current) return
        setError(messageOf(err, 'No fue posible cargar los datos.'))
      })
      .finally(() => {
        if (requestId !== latestRequestId.current) return
        setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, reloadToken])

  useEffect(() => {
    load()
  }, [load])

  const refetch = useCallback(() => setReloadToken((token) => token + 1), [])

  const create = useCallback(
    async (payload: TCreate): Promise<TItem | null> => {
      try {
        const created = await api.create(payload)
        toast.success(messages.createSuccess)
        refetch()
        return created
      } catch (err) {
        toast.error(messageOf(err, 'No fue posible crear el registro.'))
        return null
      }
    },
    [api, messages.createSuccess, refetch, toast],
  )

  const update = useCallback(
    async (id: number, payload: TUpdate): Promise<TItem | null> => {
      try {
        const updated = await api.update(id, payload)
        toast.success(messages.updateSuccess)
        refetch()
        return updated
      } catch (err) {
        toast.error(messageOf(err, 'No fue posible actualizar el registro.'))
        return null
      }
    },
    [api, messages.updateSuccess, refetch, toast],
  )

  const remove = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await api.remove(id)
        toast.success(messages.removeSuccess)
        refetch()
        return true
      } catch (err) {
        toast.error(messageOf(err, 'No fue posible eliminar el registro.'))
        return false
      }
    },
    [api, messages.removeSuccess, refetch, toast],
  )

  return { items, total, loading, error, refetch, create, update, remove }
}
