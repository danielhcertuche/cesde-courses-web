import type { Key, ReactNode } from 'react'
import { cx } from '../shared/cx'
import { Button } from '../Button/Button'
import { ChevronIcon } from '../icons'
import './Table.css'

export interface TableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
  /** Columnas `secondary` se ocultan entre 640 y 1024px (spec §5) para evitar scroll horizontal en tablet. */
  priority?: 'primary' | 'secondary'
}

export type TableSortOrder = 'asc' | 'desc'

export interface TableSortState {
  field: string
  order: TableSortOrder
}

export interface TablePaginationState {
  page: number
  pageSize: number
  total: number
}

export interface TableProps<T> {
  columns: Array<TableColumn<T>>
  data: T[]
  keyExtractor: (row: T) => Key
  loading?: boolean
  emptyState?: ReactNode
  sort?: TableSortState
  onSortChange?: (field: string) => void
  pagination?: TablePaginationState
  onPageChange?: (page: number) => void
  caption?: string
}

const SKELETON_ROWS = 5

function alignClass(align: TableColumn<unknown>['align']): string | false {
  return align ? `ui-table__cell--${align}` : false
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyState,
  sort,
  onSortChange,
  pagination,
  onPageChange,
  caption,
}: TableProps<T>) {
  const columnCount = columns.length
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1

  return (
    <div className="ui-table-wrapper">
      <table className="ui-table">
        {caption && <caption className="ui-table__caption">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((column) => {
              const isSorted = sort?.field === column.key
              const ariaSort = isSorted ? (sort?.order === 'asc' ? 'ascending' : 'descending') : 'none'
              return (
                <th
                  key={column.key}
                  scope="col"
                  className={cx(
                    'ui-table__header',
                    column.priority === 'secondary' && 'ui-table__header--secondary',
                    alignClass(column.align),
                  )}
                  aria-sort={column.sortable ? ariaSort : undefined}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className="ui-table__sort"
                      onClick={() => onSortChange?.(column.key)}
                    >
                      {column.header}
                      <ChevronIcon
                        size={12}
                        direction={isSorted && sort?.order === 'desc' ? 'up' : 'down'}
                        className={cx('ui-table__sort-icon', !isSorted && 'ui-table__sort-icon--muted')}
                      />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: SKELETON_ROWS }, (_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`} className="ui-table__row--skeleton">
                {columns.map((column) => (
                  <td key={column.key} className={cx(column.priority === 'secondary' && 'ui-table__cell--secondary')}>
                    <span className="ui-table__skeleton-bar" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columnCount} className="ui-table__empty-cell">
                {emptyState}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={keyExtractor(row)}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    data-label={column.header}
                    className={cx(column.priority === 'secondary' && 'ui-table__cell--secondary', alignClass(column.align))}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination && !loading && data.length > 0 && (
        <div className="ui-table__pagination">
          <span className="ui-table__pagination-summary">
            Página {pagination.page} de {totalPages} · {pagination.total} resultados
          </span>
          <div className="ui-table__pagination-actions">
            <Button
              size="sm"
              variant="secondary"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
            >
              Anterior
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={pagination.page >= totalPages}
              onClick={() => onPageChange?.(pagination.page + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
