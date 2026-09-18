/**
 * Reproduce, para un arreglo en memoria, el subconjunto de query params de
 * json-server 0.17 que consume la aplicación: `q`, igualdad por campo,
 * `_gte`/`_lte`, `_sort`/`_order` y `_page`/`_limit`. Fiel al orden real del
 * middleware de json-server (`plural.js`): filtra, ordena, calcula el total
 * y sólo al final pagina — así el total refleja el conjunto filtrado
 * completo, no la página devuelta.
 */

const RESERVED_KEYS = new Set(['q', '_sort', '_order', '_page', '_limit', '_expand'])

export interface QueryResult<T> {
  items: T[]
  total: number
}

/** Lee un campo arbitrario de un `Curso`/`Docente` sin exigirles firma de índice. */
function fieldValue(item: object, key: string): unknown {
  return (item as Record<string, unknown>)[key]
}

export function applyListQuery<T extends object>(source: T[], search: URLSearchParams): QueryResult<T> {
  let result = source

  const q = search.get('q')
  if (q) result = filterByFullText(result, q)

  result = filterByFields(result, search)

  const sortField = search.get('_sort')
  if (sortField) result = sortItems(result, sortField, search.get('_order'))

  const total = result.length

  if (search.has('_page') || search.has('_limit')) {
    result = paginate(result, search.get('_page'), search.get('_limit'))
  }

  return { items: result, total }
}

function filterByFullText<T extends object>(items: T[], q: string): T[] {
  const needle = q.toLowerCase()
  return items.filter((item) =>
    Object.values(item).some((value) => typeof value === 'string' && value.toLowerCase().includes(needle)),
  )
}

function filterByFields<T extends object>(items: T[], search: URLSearchParams): T[] {
  let result = items
  for (const [key, value] of search.entries()) {
    if (key === 'q' || RESERVED_KEYS.has(key)) continue

    if (key.endsWith('_gte')) {
      const field = key.slice(0, -'_gte'.length)
      result = result.filter((item) => compareRange(fieldValue(item, field), value, 'gte'))
    } else if (key.endsWith('_lte')) {
      const field = key.slice(0, -'_lte'.length)
      result = result.filter((item) => compareRange(fieldValue(item, field), value, 'lte'))
    } else {
      result = result.filter((item) => {
        const raw = fieldValue(item, key)
        return raw !== undefined && raw !== null && String(raw) === value
      })
    }
  }
  return result
}

/** Numérico si el campo lo es (precio, duración); lexicográfico si es texto (fechaInicio ISO ordena bien así). */
function compareRange(fieldValue: unknown, queryValue: string, mode: 'gte' | 'lte'): boolean {
  if (fieldValue === undefined || fieldValue === null) return false
  if (typeof fieldValue === 'number') {
    const numeric = Number(queryValue)
    return mode === 'gte' ? fieldValue >= numeric : fieldValue <= numeric
  }
  const text = String(fieldValue)
  return mode === 'gte' ? text >= queryValue : text <= queryValue
}

function compareValues(left: unknown, right: unknown): number {
  if (typeof left === 'number' && typeof right === 'number') return left - right
  const a = String(left)
  const b = String(right)
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

function sortItems<T extends object>(items: T[], field: string, order: string | null): T[] {
  const factor = order === 'desc' ? -1 : 1
  return [...items].sort((a, b) => compareValues(fieldValue(a, field), fieldValue(b, field)) * factor)
}

function paginate<T>(items: T[], page: string | null, limit: string | null): T[] {
  if (page !== null) {
    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1)
    const pageSize = Number.parseInt(limit ?? '', 10) || 10
    const start = (pageNumber - 1) * pageSize
    return items.slice(start, start + pageSize)
  }
  const pageSize = Number.parseInt(limit ?? '', 10)
  return Number.isFinite(pageSize) ? items.slice(0, pageSize) : items
}
