/**
 * Crear y editar comparten el mismo modal: `docente === null` es "crear".
 * La unicidad de `documento` y `correo` se resuelve contra el backend
 * (spec §6) vía `crearReglasUnicidadDocente`, que excluye el propio id al
 * editar para que un docente no choque consigo mismo.
 */
import { useEffect, useMemo } from 'react'
import { Field, Input, Modal, Button } from '@/ui'
import { crearValidador, reglasDocente, useForm } from '@/shared/validation'
import type { Docente, DocenteCreatePayload } from '@/shared/types'
import { crearReglasUnicidadDocente } from '../functions/docenteUnicidad'
import './DocenteFormModal.css'

export interface DocenteFormModalProps {
  open: boolean
  docente: Docente | null
  onClose: () => void
  onCreate: (payload: DocenteCreatePayload) => Promise<Docente | null>
  onUpdate: (id: number, payload: DocenteCreatePayload) => Promise<Docente | null>
}

const VALORES_VACIOS: DocenteCreatePayload = { nombre: '', documento: '', correo: '' }

/** Reglas síncronas: no dependen del docente en edición, se calculan una sola vez. */
const validar = crearValidador(reglasDocente())

function valoresDe(docente: Docente | null): DocenteCreatePayload {
  if (!docente) return VALORES_VACIOS
  return { nombre: docente.nombre, documento: docente.documento, correo: docente.correo }
}

export function DocenteFormModal({ open, docente, onClose, onCreate, onUpdate }: DocenteFormModalProps) {
  const validarAsync = useMemo(() => crearReglasUnicidadDocente(docente?.id), [docente?.id])

  const form = useForm<DocenteCreatePayload>({
    valoresIniciales: valoresDe(docente),
    validar,
    validarAsync,
    alEnviar: async (valores) => {
      const resultado = docente ? await onUpdate(docente.id, valores) : await onCreate(valores)
      if (resultado) onClose()
    },
  })

  // Al reabrir el modal se repuebla el formulario, para no arrastrar los
  // valores y errores de la edición anterior.
  useEffect(() => {
    if (open) form.reset(valoresDe(docente))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sólo debe reiniciar cuando cambia qué se edita, no en cada render de `form`
  }, [open, docente])

  return (
    <Modal open={open} onClose={onClose} title={docente ? 'Editar docente' : 'Nuevo docente'} width="md" footer={
      <>
        <Button size="md" variant="secondary" onClick={onClose} disabled={form.enviando}>
          Cancelar
        </Button>
        <Button size="md" variant="primary" onClick={() => form.handleSubmit()} loading={form.enviando} disabled={!form.esValido}>
          Guardar
        </Button>
      </>
    }>
      <form className="docente-form" onSubmit={form.handleSubmit}>
        <Field id="docente-nombre" label="Nombre completo" required error={form.errores.nombre}>
          {(controlProps) => (
            <Input
              {...controlProps}
              size="md"
              value={form.valores.nombre}
              onChange={(e) => form.handleChange('nombre', e.target.value)}
              onBlur={() => form.handleBlur('nombre')}
              placeholder="Nombre y apellidos"
            />
          )}
        </Field>

        <Field id="docente-documento" label="Documento" required error={form.errores.documento}>
          {(controlProps) => (
            <Input
              {...controlProps}
              size="md"
              value={form.valores.documento}
              onChange={(e) => form.handleChange('documento', e.target.value)}
              onBlur={() => form.handleBlur('documento')}
              placeholder="1017123456"
              inputMode="numeric"
            />
          )}
        </Field>

        <Field id="docente-correo" label="Correo" required error={form.errores.correo}>
          {(controlProps) => (
            <Input
              {...controlProps}
              size="md"
              type="email"
              value={form.valores.correo}
              onChange={(e) => form.handleChange('correo', e.target.value)}
              onBlur={() => form.handleBlur('correo')}
              placeholder="nombre@cesde.edu.co"
            />
          )}
        </Field>
      </form>
    </Modal>
  )
}
