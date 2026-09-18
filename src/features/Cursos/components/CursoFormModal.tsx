import { useEffect, useMemo } from 'react'
import { Button, Field, Input, Modal, Select, Textarea } from '@/ui'
import { crearReglaUnica, crearValidador, reglasCurso, useForm } from '@/shared/validation'
import { aInputDatetimeLocal, desdeInputDatetimeLocal } from '@/shared/format'
import type { CursoConDocente, CursoCreatePayload, Docente } from '@/shared/types'
import { nombreCursoDisponible } from '../functions/cursoRules'
import './CursoFormModal.css'

export interface CursoFormModalProps {
  open: boolean
  /** `null` = modo creación. */
  curso: CursoConDocente | null
  docentes: Docente[]
  onClose: () => void
  onCreate: (payload: CursoCreatePayload) => Promise<CursoConDocente | null>
  onUpdate: (id: number, payload: CursoCreatePayload) => Promise<CursoConDocente | null>
}

// Sentinela de "campo numérico vacío": `estaVacio()` en shared/validation lo
// reconoce vía `Number.isNaN`, así `requerido()` dispara sin necesitar un tipo
// de valores distinto al payload real que espera la API.
const VALORES_VACIOS: CursoCreatePayload = {
  nombre: '',
  descripcion: '',
  duracionSemanas: Number.NaN,
  precio: Number.NaN,
  fechaInicio: '',
  docenteId: Number.NaN,
}

function valoresDesdeCurso(curso: CursoConDocente): CursoCreatePayload {
  return {
    nombre: curso.nombre,
    descripcion: curso.descripcion,
    duracionSemanas: curso.duracionSemanas,
    precio: curso.precio,
    fechaInicio: curso.fechaInicio,
    docenteId: curso.docenteId,
  }
}

function numeroATexto(valor: number): string {
  return Number.isNaN(valor) ? '' : String(valor)
}

export function CursoFormModal({ open, curso, docentes, onClose, onCreate, onUpdate }: CursoFormModalProps) {
  const modo = curso ? 'editar' : 'crear'
  const docentesValidos = useMemo(() => docentes.map((docente) => docente.id), [docentes])

  const validar = useMemo(() => crearValidador(reglasCurso({ docentesValidos, modo })), [docentesValidos, modo])

  // Se cierra sobre `curso?.id` para que el propio registro no cuente como
  // duplicado de sí mismo al editar sin cambiar el nombre.
  const validarAsync = useMemo(
    () => ({
      nombre: crearReglaUnica((nombre: string) => nombreCursoDisponible(nombre, curso?.id)),
    }),
    [curso?.id],
  )

  const form = useForm<CursoCreatePayload>({
    valoresIniciales: curso ? valoresDesdeCurso(curso) : VALORES_VACIOS,
    validar,
    validarAsync,
    alEnviar: async (valores) => {
      const resultado = curso ? await onUpdate(curso.id, valores) : await onCreate(valores)
      if (resultado) onClose()
    },
  })

  // Reinicia el formulario cada vez que el modal se abre para un curso
  // distinto (o para crear uno nuevo): sin esto, reabrir arrastraría los
  // valores y errores de la edición anterior.
  useEffect(() => {
    if (open) form.reset(curso ? valoresDesdeCurso(curso) : VALORES_VACIOS)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sólo debe reiniciar cuando cambia qué se edita, no en cada render de `form`
  }, [open, curso])

  if (!open) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modo === 'crear' ? 'Nuevo curso' : 'Editar curso'}
      width="lg"
      footer={
        <div className="curso-form-modal__actions">
          <Button size="md" variant="secondary" onClick={onClose} disabled={form.enviando}>
            Cancelar
          </Button>
          <Button
            size="md"
            variant="primary"
            onClick={() => form.handleSubmit()}
            loading={form.enviando}
            disabled={!form.esValido}
          >
            Guardar
          </Button>
        </div>
      }
    >
      <form className="curso-form-modal__grid" onSubmit={form.handleSubmit}>
        <div className="curso-form-modal__span-2">
          <Field
            id="curso-nombre"
            label="Nombre del curso"
            required
            error={form.errores.nombre}
            hint={form.validando.nombre ? 'Comprobando disponibilidad…' : undefined}
          >
            {(cp) => (
              <Input
                {...cp}
                size="md"
                value={form.valores.nombre}
                onChange={(e) => form.handleChange('nombre', e.target.value)}
                onBlur={() => form.handleBlur('nombre')}
              />
            )}
          </Field>
        </div>

        <Field id="curso-docente" label="Docente" required error={form.errores.docenteId}>
          {(cp) => (
            <Select
              {...cp}
              size="md"
              value={Number.isNaN(form.valores.docenteId) ? '' : form.valores.docenteId}
              onChange={(e) =>
                form.handleChange('docenteId', e.target.value === '' ? Number.NaN : Number(e.target.value))
              }
              onBlur={() => form.handleBlur('docenteId')}
            >
              <option value="">Selecciona un docente</option>
              {docentes.map((docente) => (
                <option key={docente.id} value={docente.id}>
                  {docente.nombre}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field
          id="curso-fecha-inicio"
          label="Fecha y hora de inicio"
          required
          error={form.errores.fechaInicio}
          hint={modo === 'editar' ? 'Al editar se admite una fecha ya pasada.' : undefined}
        >
          {(cp) => (
            <Input
              {...cp}
              size="md"
              type="datetime-local"
              value={aInputDatetimeLocal(form.valores.fechaInicio)}
              onChange={(e) => form.handleChange('fechaInicio', desdeInputDatetimeLocal(e.target.value))}
              onBlur={() => form.handleBlur('fechaInicio')}
            />
          )}
        </Field>

        <Field id="curso-duracion" label="Duración (semanas)" required error={form.errores.duracionSemanas}>
          {(cp) => (
            <Input
              {...cp}
              size="md"
              type="number"
              min={1}
              max={104}
              step={1}
              value={numeroATexto(form.valores.duracionSemanas)}
              onChange={(e) =>
                form.handleChange('duracionSemanas', e.target.value === '' ? Number.NaN : Number(e.target.value))
              }
              onBlur={() => form.handleBlur('duracionSemanas')}
            />
          )}
        </Field>

        <Field id="curso-precio" label="Precio (COP)" required error={form.errores.precio}>
          {(cp) => (
            <Input
              {...cp}
              size="md"
              type="number"
              min={0}
              step="0.01"
              value={numeroATexto(form.valores.precio)}
              onChange={(e) => form.handleChange('precio', e.target.value === '' ? Number.NaN : Number(e.target.value))}
              onBlur={() => form.handleBlur('precio')}
            />
          )}
        </Field>

        <div className="curso-form-modal__span-2">
          <Field id="curso-descripcion" label="Descripción" required error={form.errores.descripcion}>
            {(cp) => (
              <Textarea
                {...cp}
                size="md"
                rows={4}
                value={form.valores.descripcion}
                onChange={(e) => form.handleChange('descripcion', e.target.value)}
                onBlur={() => form.handleBlur('descripcion')}
              />
            )}
          </Field>
        </div>
      </form>
    </Modal>
  )
}
