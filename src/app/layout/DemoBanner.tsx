import { useState } from 'react'
import { AlertIcon, Button, ConfirmDialog } from '@/ui'
import './DemoBanner.css'

/**
 * Aviso permanente y discreto de que esta build corre sobre datos locales
 * del navegador (spec de despliegue demo). Sólo existe en modo demo: en
 * desarrollo y en un despliegue contra un backend real, `VITE_API_MODE` no
 * vale `'demo'` y el componente no renderiza nada.
 */
export function DemoBanner() {
  const [confirming, setConfirming] = useState(false)
  const [restableciendo, setRestableciendo] = useState(false)

  if (import.meta.env.VITE_API_MODE !== 'demo') return null

  async function restablecer() {
    setRestableciendo(true)
    const { resetDemoData } = await import('@/shared/api/demo')
    resetDemoData()
    // Recarga completa: la forma más simple de que cursos y docentes reflejen
    // el estado sembrado sin plumbing de invalidación entre features.
    window.location.reload()
  }

  return (
    <div className="demo-banner" role="status">
      <AlertIcon size={16} />
      <span className="demo-banner__text">
        Demostración con datos guardados en este navegador. No se comparten con nadie más.
      </span>
      <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>
        Restablecer datos de ejemplo
      </Button>

      <ConfirmDialog
        open={confirming}
        title="Restablecer datos de ejemplo"
        description="Se perderán los cursos y docentes creados o editados en este navegador, y se volverá al catálogo original."
        confirmLabel="Restablecer"
        danger
        loading={restableciendo}
        onConfirm={restablecer}
        onCancel={() => setConfirming(false)}
      />
    </div>
  )
}
