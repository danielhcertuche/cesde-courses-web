import { useEffect, useRef, useState } from 'react'
import { Button, Field, Input, Select } from '@/ui'
import { FilterIcon } from '@/ui'
import type { Docente } from '@/shared/types'
import { contarFiltrosActivos, filtrosIguales, type CursosFiltrosBusqueda } from '../functions/cursoRules'
import './CursosFilters.css'

export interface CursosFiltersProps {
  filtros: CursosFiltrosBusqueda
  docentes: Docente[]
  onChange: (siguiente: CursosFiltrosBusqueda) => void
  onClear: () => void
}

const DEBOUNCE_MS = 300

function aTexto(valor: number | undefined): string {
  return valor === undefined ? '' : String(valor)
}

function aNumero(texto: string): number | undefined {
  if (texto === '') return undefined
  const numero = Number(texto)
  return Number.isFinite(numero) ? numero : undefined
}

/**
 * Barra de los 5 filtros de la spec §3. El estado visible es un "borrador"
 * local que se despacha 300 ms después de la última interacción (spec: debounce
 * en el texto; aquí se generaliza a los ocho campos para no encadenar una
 * petición por cada dígito de un rango numérico). Un cambio externo — por
 * ejemplo, "Quitar filtros" desde el estado vacío de la tabla — se detecta
 * comparando contra el último valor que este componente despachó, para no
 * pisar lo que el usuario está escribiendo.
 */
export function CursosFilters({ filtros, docentes, onChange, onClear }: CursosFiltersProps) {
  const [expandido, setExpandido] = useState(false)
  const [borrador, setBorrador] = useState<CursosFiltrosBusqueda>(filtros)
  const ultimoDespachado = useRef(filtros)

  useEffect(() => {
    if (filtrosIguales(filtros, ultimoDespachado.current)) return
    ultimoDespachado.current = filtros
    setBorrador(filtros)
  }, [filtros])

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (filtrosIguales(borrador, filtros)) return
      ultimoDespachado.current = borrador
      onChange(borrador)
    }, DEBOUNCE_MS)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sólo debe reiniciar el temporizador cuando cambia el borrador
  }, [borrador])

  function actualizar<K extends keyof CursosFiltrosBusqueda>(campo: K, valor: CursosFiltrosBusqueda[K]) {
    setBorrador((anterior) => ({ ...anterior, [campo]: valor }))
  }

  const activos = contarFiltrosActivos(borrador)

  return (
    <div className="cursos-filters">
      <div className="cursos-filters__bar">
        <button
          type="button"
          className="cursos-filters__toggle"
          aria-expanded={expandido}
          aria-controls="cursos-filters-panel"
          onClick={() => setExpandido((valor) => !valor)}
        >
          <FilterIcon size={14} />
          Filtros{activos > 0 ? ` (${activos})` : ''}
        </button>
        {activos > 0 && (
          <Button size="sm" variant="ghost" onClick={onClear}>
            Limpiar filtros
          </Button>
        )}
      </div>

      <div
        id="cursos-filters-panel"
        className={`cursos-filters__panel${expandido ? ' cursos-filters__panel--expanded' : ''}`}
      >
        <div className="cursos-filters__field">
          <Field id="curso-filtro-texto" label="Buscar" hint="Nombre o descripción">
            {(cp) => (
              <Input
                {...cp}
                size="sm"
                type="search"
                placeholder="Ej. desarrollo web"
                value={borrador.q ?? ''}
                onChange={(e) => actualizar('q', e.target.value || undefined)}
              />
            )}
          </Field>
        </div>

        <div className="cursos-filters__field">
          <Field id="curso-filtro-docente" label="Docente">
            {(cp) => (
              <Select
                {...cp}
                size="sm"
                value={borrador.docenteId ?? ''}
                onChange={(e) => actualizar('docenteId', aNumero(e.target.value))}
              >
                <option value="">Todos los docentes</option>
                {docentes.map((docente) => (
                  <option key={docente.id} value={docente.id}>
                    {docente.nombre}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>

        <div className="cursos-filters__field cursos-filters__range">
          <Field id="curso-filtro-precio-min" label="Precio mínimo (COP)">
            {(cp) => (
              <Input
                {...cp}
                size="sm"
                type="number"
                min={0}
                inputMode="decimal"
                value={aTexto(borrador.precioMin)}
                onChange={(e) => actualizar('precioMin', aNumero(e.target.value))}
              />
            )}
          </Field>
          <Field id="curso-filtro-precio-max" label="Precio máximo (COP)">
            {(cp) => (
              <Input
                {...cp}
                size="sm"
                type="number"
                min={0}
                inputMode="decimal"
                value={aTexto(borrador.precioMax)}
                onChange={(e) => actualizar('precioMax', aNumero(e.target.value))}
              />
            )}
          </Field>
        </div>

        <div className="cursos-filters__field cursos-filters__range">
          <Field id="curso-filtro-fecha-desde" label="Inicio desde">
            {(cp) => (
              <Input
                {...cp}
                size="sm"
                type="date"
                value={borrador.fechaDesde ?? ''}
                onChange={(e) => actualizar('fechaDesde', e.target.value || undefined)}
              />
            )}
          </Field>
          <Field id="curso-filtro-fecha-hasta" label="Inicio hasta">
            {(cp) => (
              <Input
                {...cp}
                size="sm"
                type="date"
                value={borrador.fechaHasta ?? ''}
                onChange={(e) => actualizar('fechaHasta', e.target.value || undefined)}
              />
            )}
          </Field>
        </div>

        <div className="cursos-filters__field cursos-filters__range">
          <Field id="curso-filtro-duracion-min" label="Duración mínima (semanas)">
            {(cp) => (
              <Input
                {...cp}
                size="sm"
                type="number"
                min={1}
                max={104}
                inputMode="numeric"
                value={aTexto(borrador.duracionMin)}
                onChange={(e) => actualizar('duracionMin', aNumero(e.target.value))}
              />
            )}
          </Field>
          <Field id="curso-filtro-duracion-max" label="Duración máxima (semanas)">
            {(cp) => (
              <Input
                {...cp}
                size="sm"
                type="number"
                min={1}
                max={104}
                inputMode="numeric"
                value={aTexto(borrador.duracionMax)}
                onChange={(e) => actualizar('duracionMax', aNumero(e.target.value))}
              />
            )}
          </Field>
        </div>
      </div>
    </div>
  )
}
