/**
 * Semilla del backend simulado: mismo `db.json` que consume json-server en
 * desarrollo. Se importa directamente para no duplicar el dataset en un
 * segundo archivo — éste es el único lugar donde la demo lo lee.
 */
import datos from '../../../../db.json'
import type { Curso, Docente } from '@/shared/types'

export interface DemoDatabase {
  docentes: Docente[]
  cursos: Curso[]
}

const seed = datos as DemoDatabase

/** Copia profunda: cada arranque o restablecimiento parte de datos propios, nunca de la referencia importada (que sólo existe una vez por sesión de módulo). */
export function cloneSeed(): DemoDatabase {
  return {
    docentes: seed.docentes.map((docente) => ({ ...docente })),
    cursos: seed.cursos.map((curso) => ({ ...curso })),
  }
}
