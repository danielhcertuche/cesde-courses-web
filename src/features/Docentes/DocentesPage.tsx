/**
 * Compone la búsqueda (dentro de `DocentesTable`), la tabla y el modal de
 * crear/editar. También orquesta el borrado con integridad referencial
 * (spec §2): antes de pedir confirmación se consulta cuántos cursos tiene
 * el docente (`contarCursosDeDocente`, lectura informativa); si tiene
 * alguno, la acción se bloquea aquí mismo y se ofrece ir al listado de
 * cursos filtrado. El borrado real siempre pasa por `useDocentes().remove`,
 * que repite su propia comprobación antes de ejecutar el `DELETE`.
 */
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, ConfirmDialog, PlusIcon } from '@/ui'
import type { Docente } from '@/shared/types'
import { useDocentes } from './hooks/useDocentes'
import { DocentesTable } from './components/DocentesTable'
import { DocenteFormModal } from './components/DocenteFormModal'
import { contarCursosDeDocente } from './functions/cursosAsociados'
import { DOCENTE_QUERY_PARAM } from './constants'
import './DocentesPage.css'

type DeleteFlow =
  | { status: 'idle' }
  | { status: 'checking'; docente: Docente }
  | { status: 'confirm'; docente: Docente }
  | { status: 'blocked'; docente: Docente; cursosCount: number }

function fraseCursosAsociados(cantidad: number): string {
  return cantidad === 1 ? '1 curso asociado' : `${cantidad} cursos asociados`
}

export default function DocentesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const docentes = useDocentes({ q: searchParams.get(DOCENTE_QUERY_PARAM) ?? undefined })

  const [editingDocente, setEditingDocente] = useState<Docente | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteFlow, setDeleteFlow] = useState<DeleteFlow>({ status: 'idle' })
  const [removing, setRemoving] = useState(false)

  function openCreate(): void {
    setEditingDocente(null)
    setModalOpen(true)
  }

  function openEdit(docente: Docente): void {
    setEditingDocente(docente)
    setModalOpen(true)
  }

  async function handleDeleteRequest(docente: Docente): Promise<void> {
    setDeleteFlow({ status: 'checking', docente })
    try {
      const cursosCount = await contarCursosDeDocente(docente.id)
      setDeleteFlow(
        cursosCount > 0 ? { status: 'blocked', docente, cursosCount } : { status: 'confirm', docente },
      )
    } catch {
      // La comprobación informativa falló (p. ej. red intermitente): no se
      // bloquea al usuario, `remove` decide y explica el resultado por su cuenta.
      setDeleteFlow({ status: 'confirm', docente })
    }
  }

  async function handleConfirmDelete(): Promise<void> {
    if (deleteFlow.status !== 'confirm') return
    setRemoving(true)
    const ok = await docentes.remove(deleteFlow.docente.id)
    setRemoving(false)
    if (ok) setDeleteFlow({ status: 'idle' })
  }

  function handleGoToCursos(docenteId: number): void {
    setDeleteFlow({ status: 'idle' })
    navigate(`/cursos?docenteId=${docenteId}`)
  }

  const pendingDeleteId = deleteFlow.status === 'checking' ? deleteFlow.docente.id : null

  return (
    <div>
      <div className="docentes-page__header">
        <h1 className="docentes-page__title">Docentes</h1>
        <Button size="sm" variant="primary" iconLeft={<PlusIcon size={16} />} onClick={openCreate}>
          Nuevo docente
        </Button>
      </div>

      <DocentesTable
        items={docentes.items}
        loading={docentes.loading}
        error={docentes.error}
        onRetry={docentes.refetch}
        onEdit={openEdit}
        onDeleteRequest={handleDeleteRequest}
        pendingDeleteId={pendingDeleteId}
      />

      <DocenteFormModal
        open={modalOpen}
        docente={editingDocente}
        onClose={() => setModalOpen(false)}
        onCreate={docentes.create}
        onUpdate={docentes.update}
      />

      {deleteFlow.status === 'confirm' && (
        <ConfirmDialog
          open
          title="Eliminar docente"
          description={`¿Eliminar a ${deleteFlow.docente.nombre}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          danger
          loading={removing}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteFlow({ status: 'idle' })}
        />
      )}

      {deleteFlow.status === 'blocked' && (
        <ConfirmDialog
          open
          title="No se puede eliminar"
          description={`${deleteFlow.docente.nombre} tiene ${fraseCursosAsociados(deleteFlow.cursosCount)}. Reasigna esos cursos antes de eliminarlo.`}
          confirmLabel="Ver cursos"
          cancelLabel="Cerrar"
          onConfirm={() => handleGoToCursos(deleteFlow.docente.id)}
          onCancel={() => setDeleteFlow({ status: 'idle' })}
        />
      )}
    </div>
  )
}
