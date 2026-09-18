import type { ReactNode } from 'react'
import { Button, Table } from '@/ui'
import { EditIcon, TrashIcon } from '@/ui'
import type { TableColumn, TablePaginationState, TableSortState } from '@/ui'
import { formatearCOP, formatearFechaLegible } from '@/shared/format'
import type { CursoConDocente } from '@/shared/types'
import './CursosTable.css'

export interface CursosTableProps {
  cursos: CursoConDocente[]
  loading: boolean
  sort: TableSortState
  onSortChange: (field: string) => void
  pagination: TablePaginationState
  onPageChange: (page: number) => void
  emptyState: ReactNode
  onEdit: (curso: CursoConDocente) => void
  onDelete: (curso: CursoConDocente) => void
}

/**
 * Tabla de cursos sobre la primitiva `Table` de `@/ui`. Ordenable por las 4
 * columnas permitidas (spec §3); descripción y duración quedan marcadas como
 * `secondary` para que la primitiva las oculte entre 640 y 1024px y colapse a
 * tarjetas por debajo de 640px — ese comportamiento vive por completo en
 * `Table.css`, este componente sólo declara la prioridad.
 */
export function CursosTable({
  cursos,
  loading,
  sort,
  onSortChange,
  pagination,
  onPageChange,
  emptyState,
  onEdit,
  onDelete,
}: CursosTableProps) {
  const columns: Array<TableColumn<CursoConDocente>> = [
    { key: 'nombre', header: 'Nombre', sortable: true, render: (curso) => curso.nombre },
    {
      key: 'docente',
      header: 'Docente',
      render: (curso) => curso.docente?.nombre ?? 'Sin asignar',
    },
    {
      key: 'precio',
      header: 'Precio',
      sortable: true,
      align: 'right',
      render: (curso) => formatearCOP(curso.precio),
    },
    {
      key: 'fechaInicio',
      header: 'Fecha de inicio',
      sortable: true,
      render: (curso) => formatearFechaLegible(curso.fechaInicio),
    },
    {
      key: 'duracionSemanas',
      header: 'Duración',
      sortable: true,
      align: 'right',
      priority: 'secondary',
      render: (curso) => `${curso.duracionSemanas} semanas`,
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      priority: 'secondary',
      render: (curso) => curso.descripcion,
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      render: (curso) => (
        <span className="cursos-table__actions">
          <Button size="sm" variant="ghost" iconLeft={<EditIcon size={14} />} onClick={() => onEdit(curso)}>
            Editar
          </Button>
          <Button size="sm" variant="ghost" className="cursos-table__delete" iconLeft={<TrashIcon size={14} />} onClick={() => onDelete(curso)}>
            Eliminar
          </Button>
        </span>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={cursos}
      keyExtractor={(curso) => curso.id}
      loading={loading}
      emptyState={emptyState}
      sort={sort}
      onSortChange={onSortChange}
      pagination={pagination}
      onPageChange={onPageChange}
      caption="Listado de cursos"
    />
  )
}
