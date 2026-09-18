/**
 * Persistencia del backend simulado. `localStorage` puede lanzar en
 * navegación privada o con la cuota agotada: toda lectura/escritura va
 * envuelta en `try/catch` y, si falla, la demo sigue funcionando sólo en
 * memoria durante esa sesión.
 */
import { cloneSeed, type DemoDatabase } from './seed'

const STORAGE_KEY = 'cesde-courses-web:demo-db:v1'

function readFromStorage(): DemoDatabase | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as DemoDatabase) : null
  } catch {
    return null
  }
}

function writeToStorage(state: DemoDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* sin cuota o sin acceso: la sesión continúa sólo en memoria */
  }
}

let state: DemoDatabase = readFromStorage() ?? cloneSeed()

/** Estado mutable en vivo: `router.ts` empuja/edita/elimina directamente sobre estos arreglos y llama a `persist()`. */
export function getState(): DemoDatabase {
  return state
}

export function persist(): void {
  writeToStorage(state)
}

/** Restablece los datos de ejemplo: usado por el aviso de demo en la interfaz. */
export function resetDemoData(): void {
  state = cloneSeed()
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* nada que limpiar si no hay acceso a localStorage */
  }
}
