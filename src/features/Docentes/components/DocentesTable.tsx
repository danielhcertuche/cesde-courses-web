/**
 * Listado de docentes: caja de búsqueda enlazada a la URL (spec §3, sobre el
 * único filtro de docentes, `q`) + tabla primitiva de `@/ui`. Componente de
 * presentación: recibe los datos ya resueltos por `useDocentes` en
 * `DocentesPage` y sólo decide cómo pintarlos (los cuatro estados de la
 * spec §5) y cuándo pedir una acción hacia arriba (editar/eliminar).
 */
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertIcon, Button, EditIcon, EmptyState, Input, Table, TrashIcon, type TableColumn } from '@/ui'
import type { Docente } from '@/shared/types'
import { DOCENTE_QUERY_PARAM, DOCENTE_SEARCH_DEBOUNCE_MS } from '../constants'
import './DocentesTable.css'

export interface DocentesTableProps {
  items: Docente[]
  loading: boolean
  error: string | null
  onRetry: () => void
  onEdit: (docente: Docente) => void
  onDeleteRequest: (docente: Docente) => void
  /** Docente cuya comprobación previa a eliminar está en curso: deshabilita esa fila. */
  pendingDeleteId: number | null
}

const COLUMNS: Array<TableColumn<Docente>> = [
  { key: 'nombre', header: 'Nombre', render: (d) => d.nombre, priority: 'primary' },
  { key: 'documento', header: 'Documento', render: (d) => d.documento, priority: 'primary' },
  { key: 'correo', header: 'Correo', render: (d) => d.correo, priority: 'secondary' },
]

export function DocentesTable({ items, loading, error, onRetry, onEdit, onDeleteRequest, pendingDeleteId }: DocentesTableProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get(DOCENTE_QUERY_PARAM) ?? ''
  const [term, setTerm] = useState(query)

  // La URL pudo cambiar por fuera de este input (p. ej. "Quitar filtros"): se realinea.
  useEffect(() => setTerm(query), [query])

  useEffect(() => {
    if (term === query) return
    const handle = window.setTimeout(() => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          if (term.trim()) next.set(DOCENTE_QUERY_PARAM, term.trim())
          else next.delete(DOCENTE_QUERY_PARAM)
          return next
        },
        { replace: true },
      )
    }, DOCENTE_SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [term, query, setSearchParams])

  function clearSearch(): void {
    setTerm('')
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      next.delete(DOCENTE_QUERY_PARAM)
      return next
    }, { replace: true })
  }

  const columns: Array<TableColumn<Docente>> = [
    ...COLUMNS,
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      priority: 'primary',
      render: (docente) => (
        <div className="docentes-table__actions">
          <Button size="sm" variant="ghost" iconLeft={<EditIcon size={14} />} onClick={() => onEdit(docente)}>
            Editar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="docentes-table__delete"
            iconLeft={<TrashIcon size={14} />}
            loading={pendingDeleteId === docente.id}
            onClick={() => onDeleteRequest(docente)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ]

  return (
    <section>
      <div className="docentes-table__toolbar">
        <label className="docentes-table__toolbar-label" htmlFor="docentes-search">
          Buscar
        </label>
        <Input
          id="docentes-search"
          size="sm"
          type="search"
          placeholder="Nombre o documento"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
        />
      </div>

      {error ? (
        <EmptyState
          icon={<AlertIcon size={28} />}
          title="No fue posible cargar los docentes."
          description={error}
          action={
            <Button size="sm" variant="secondary" onClick={onRetry}>
              Reintentar
            </Button>
          }
        />
      ) : (
        <Table
          columns={columns}
          data={items}
          keyExtractor={(docente) => docente.id}
          loading={loading}
          emptyState={
            query ? (
              <EmptyState
                title="No se encontraron docentes para esa búsqueda."
                description={`No hay coincidencias para "${query}".`}
                action={
                  <Button size="sm" variant="secondary" onClick={clearSearch}>
                    Quitar filtros
                  </Button>
                }
              />
            ) : (
              <EmptyState
                title="Aún no hay docentes registrados."
                description="Crea el primer docente con el botón «Nuevo docente»."
              />
            )
          }
        />
      )}
    </section>
  )
}
