import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/app/layout/AppShell'
import { NotFound } from '@/app/pages/NotFound'
import { Spinner } from '@/ui'

// Carga diferida por pantalla: el arranque no descarga el módulo de Docentes
// para quien entra directo al listado de cursos.
const CursosPage = lazy(() => import('@/features/Cursos/CursosPage'))
const DocentesPage = lazy(() => import('@/features/Docentes/DocentesPage'))

function Cargando() {
  return (
    <div role="status" aria-live="polite" style={{ padding: 'var(--c-space-8)', textAlign: 'center' }}>
      <Spinner size="md" />
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/cursos" replace />} />
        <Route
          path="cursos"
          element={
            <Suspense fallback={<Cargando />}>
              <CursosPage />
            </Suspense>
          }
        />
        <Route
          path="docentes"
          element={
            <Suspense fallback={<Cargando />}>
              <DocentesPage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
