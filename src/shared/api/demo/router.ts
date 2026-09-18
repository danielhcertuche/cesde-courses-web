/**
 * Equivalente en memoria de las rutas que json-server genera para `/cursos`
 * y `/docentes`: mismo contrato de status y de cuerpo que consume el resto
 * de la aplicación a través de `client.ts`.
 */
import type { Curso, CursoConDocente, Docente } from '@/shared/types'
import { applyListQuery } from './queryEngine'
import { getState, persist } from './store'

export interface DemoResponse {
  status: number
  body: unknown
  total: number
}

function notFound(): DemoResponse {
  return { status: 404, body: {}, total: 0 }
}

function ok(body: unknown, total = 0): DemoResponse {
  return { status: 200, body, total }
}

function created(body: unknown): DemoResponse {
  return { status: 201, body, total: 0 }
}

/** Igual que `createId` de json-server: 1 si la colección está vacía, si no el máximo id existente + 1. */
function nextId(items: Array<{ id: number }>): number {
  if (items.length === 0) return 1
  return Math.max(...items.map((item) => item.id)) + 1
}

function parseBody<T>(init: RequestInit | undefined): T {
  const raw = typeof init?.body === 'string' ? init.body : '{}'
  return JSON.parse(raw) as T
}

function expandDocente(curso: Curso, docentes: Docente[]): CursoConDocente {
  return { ...curso, docente: docentes.find((docente) => docente.id === curso.docenteId) }
}

export function dispatchDemoRequest(path: string, init?: RequestInit): DemoResponse {
  const method = (init?.method ?? 'GET').toUpperCase()
  const url = new URL(path, 'http://demo.local')
  const [resource, idRaw] = url.pathname.split('/').filter(Boolean)

  if (resource === 'cursos') return handleCursos(method, idRaw, url.searchParams, init)
  if (resource === 'docentes') return handleDocentes(method, idRaw, url.searchParams, init)
  return notFound()
}

function handleCursos(
  method: string,
  idRaw: string | undefined,
  search: URLSearchParams,
  init: RequestInit | undefined,
): DemoResponse {
  const state = getState()

  if (method === 'GET' && idRaw === undefined) {
    const { items, total } = applyListQuery(state.cursos, search)
    const body = search.get('_expand') === 'docente' ? items.map((curso) => expandDocente(curso, state.docentes)) : items
    return ok(body, total)
  }

  if (method === 'GET' && idRaw !== undefined) {
    const curso = state.cursos.find((item) => item.id === Number(idRaw))
    return curso ? ok(curso) : notFound()
  }

  if (method === 'POST') {
    const payload = parseBody<Omit<Curso, 'id'>>(init)
    const curso: Curso = { ...payload, id: nextId(state.cursos) }
    state.cursos.push(curso)
    persist()
    return created(curso)
  }

  if (method === 'PUT' && idRaw !== undefined) {
    const id = Number(idRaw)
    const index = state.cursos.findIndex((item) => item.id === id)
    if (index === -1) return notFound()
    const payload = parseBody<Omit<Curso, 'id'>>(init)
    const curso: Curso = { ...payload, id }
    state.cursos[index] = curso
    persist()
    return ok(curso)
  }

  if (method === 'DELETE' && idRaw !== undefined) {
    const id = Number(idRaw)
    const index = state.cursos.findIndex((item) => item.id === id)
    if (index === -1) return notFound()
    state.cursos.splice(index, 1)
    persist()
    return ok({})
  }

  return notFound()
}

function handleDocentes(
  method: string,
  idRaw: string | undefined,
  search: URLSearchParams,
  init: RequestInit | undefined,
): DemoResponse {
  const state = getState()

  if (method === 'GET' && idRaw === undefined) {
    const { items, total } = applyListQuery(state.docentes, search)
    return ok(items, total)
  }

  if (method === 'GET' && idRaw !== undefined) {
    const docente = state.docentes.find((item) => item.id === Number(idRaw))
    return docente ? ok(docente) : notFound()
  }

  if (method === 'POST') {
    const payload = parseBody<Omit<Docente, 'id'>>(init)
    const docente: Docente = { ...payload, id: nextId(state.docentes) }
    state.docentes.push(docente)
    persist()
    return created(docente)
  }

  if (method === 'PUT' && idRaw !== undefined) {
    const id = Number(idRaw)
    const index = state.docentes.findIndex((item) => item.id === id)
    if (index === -1) return notFound()
    const payload = parseBody<Omit<Docente, 'id'>>(init)
    const docente: Docente = { ...payload, id }
    state.docentes[index] = docente
    persist()
    return ok(docente)
  }

  if (method === 'DELETE' && idRaw !== undefined) {
    const id = Number(idRaw)
    const index = state.docentes.findIndex((item) => item.id === id)
    if (index === -1) return notFound()
    state.docentes.splice(index, 1)
    persist()
    return ok({})
  }

  return notFound()
}
