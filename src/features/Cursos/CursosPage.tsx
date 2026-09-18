import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertIcon, Button, ConfirmDialog, EmptyState, PlusIcon } from '@/ui'
import type { TableSortState } from '@/ui'
import type { CursoConDocente, CursoSortField } from '@/shared/types'
import { useCursos } from './hooks/useCursos'
import { CursosFilters } from './components/CursosFilters'
import { CursosTable } from './components/CursosTable'
import { CursoFormModal } from './components/CursoFormModal'
import { useDocentesOptions } from './components/useDocentesOptions'
import { contarFiltrosActivos, filtrosDesdeUrl, filtrosParaApi, urlDesdeFiltros } from './functions/cursoRules'
import './CursosPage.css'

const TAMANIO_PAGINA = 10

/** Página de administración de cursos: compone filtros, tabla y modal (spec §4). */
export default function CursosPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filtrosUrl = filtrosDesdeUrl(searchParams)
  const filtrosActivos = contarFiltrosActivos(filtrosUrl)
  const filtrosKey = JSON.stringify(filtrosUrl)

  const [sort, setSort] = useState<TableSortState>({ field: 'nombre', order: 'asc' })
  const [page, setPage] = useState(1)

  // Un cambio de filtro puede dejar la página actual fuera de rango (p. ej.
  // se estaba en la página 3 y el resultado filtrado sólo tiene una). La
  // dependencia es la clave por contenido, no el objeto de filtros: su
  // identidad cambia en cada render y reiniciaría la página sin motivo.
  useEffect(() => {
    setPage(1)
  }, [filtrosKey])

  const { docentes } = useDocentesOptions()

  const { items, total, loading, error, refetch, create, update, remove } = useCursos({
    ...filtrosParaApi(filtrosUrl),
    sort: sort.field as CursoSortField,
    order: sort.order,
    page,
    limit: TAMANIO_PAGINA,
  })

  const [cursoEnEdicion, setCursoEnEdicion] = useState<CursoConDocente | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cursoAEliminar, setCursoAEliminar] = useState<CursoConDocente | null>(null)
  const [eliminando, setEliminando] = useState(false)

  function actualizarFiltros(siguiente: typeof filtrosUrl) {
    setSearchParams(urlDesdeFiltros(siguiente), { replace: true })
  }

  function limpiarFiltros() {
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  function abrirCreacion() {
    setCursoEnEdicion(null)
    setModalAbierto(true)
  }

  function abrirEdicion(curso: CursoConDocente) {
    setCursoEnEdicion(curso)
    setModalAbierto(true)
  }

  function manejarCambioOrden(field: string) {
    setSort((anterior) => ({
      field: field as CursoSortField,
      order: anterior.field === field && anterior.order === 'asc' ? 'desc' : 'asc',
    }))
    setPage(1)
  }

  async function confirmarEliminacion() {
    if (!cursoAEliminar) return
    setEliminando(true)
    const eliminado = await remove(cursoAEliminar.id)
    setEliminando(false)
    if (eliminado) setCursoAEliminar(null)
  }

  const emptyState =
    filtrosActivos > 0 ? (
      <EmptyState
        title="No se encontraron cursos con estos filtros"
        description="Ajusta o quita los filtros para ver más resultados."
        action={
          <Button size="sm" variant="secondary" onClick={limpiarFiltros}>
            Quitar filtros
          </Button>
        }
      />
    ) : (
      <EmptyState
        title="Todavía no hay cursos registrados"
        description="Crea el primer curso para empezar a llenar el catálogo."
        action={
          <Button size="sm" variant="primary" iconLeft={<PlusIcon size={14} />} onClick={abrirCreacion}>
            Nuevo curso
          </Button>
        }
      />
    )

  return (
    <section className="cursos-page" aria-labelledby="cursos-page-title">
      <header className="cursos-page__header">
        <h2 id="cursos-page-title">Cursos</h2>
        <Button size="sm" variant="primary" iconLeft={<PlusIcon size={14} />} onClick={abrirCreacion}>
          Nuevo curso
        </Button>
      </header>

      <CursosFilters filtros={filtrosUrl} docentes={docentes} onChange={actualizarFiltros} onClear={limpiarFiltros} />

      {error ? (
        <EmptyState
          icon={<AlertIcon size={24} />}
          title="No fue posible cargar los cursos"
          description={error}
          action={
            <Button size="sm" variant="secondary" onClick={refetch}>
              Reintentar
            </Button>
          }
        />
      ) : (
        <CursosTable
          cursos={items}
          loading={loading}
          sort={sort}
          onSortChange={manejarCambioOrden}
          pagination={{ page, pageSize: TAMANIO_PAGINA, total }}
          onPageChange={setPage}
          emptyState={emptyState}
          onEdit={abrirEdicion}
          onDelete={setCursoAEliminar}
        />
      )}

      <CursoFormModal
        open={modalAbierto}
        curso={cursoEnEdicion}
        docentes={docentes}
        onClose={() => setModalAbierto(false)}
        onCreate={create}
        onUpdate={update}
      />

      <ConfirmDialog
        open={Boolean(cursoAEliminar)}
        title="Eliminar curso"
        description={`¿Eliminar el curso "${cursoAEliminar?.nombre ?? ''}"? Esta acción no se puede deshacer.`}
        danger
        loading={eliminando}
        onConfirm={confirmarEliminacion}
        onCancel={() => setCursoAEliminar(null)}
      />
    </section>
  )
}
