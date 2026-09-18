import { Suspense, lazy, type ReactElement } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from '@/app/layout/AppShell'
import { NotFound } from '@/app/pages/NotFound'
import { useAuth } from '@/features/Auth/AuthContext'
import { Spinner } from '@/ui'

// Carga diferida por pantalla: el arranque no descarga el módulo de Docentes
// para quien entra directo al listado de cursos.
const CursosPage = lazy(() => import('@/features/Cursos/CursosPage'))
const DocentesPage = lazy(() => import('@/features/Docentes/DocentesPage'))
const LoginPage = lazy(() => import('@/features/Auth/LoginPage'))

function Cargando() {
  return (
    <div role="status" aria-live="polite" style={{ padding: 'var(--c-space-8)', textAlign: 'center' }}>
      <Spinner size="md" />
    </div>
  )
}

/**
 * Exige sesión: sin `usuario`, redirige a `/login` conservando la ubicación pedida en
 * `state.from`, para que `LoginPage` pueda volver ahí después de entrar.
 */
function RutaProtegida({ children }: { children: ReactElement }) {
  const { usuario, cargando } = useAuth()
  const location = useLocation()

  if (cargando) return <Cargando />
  if (!usuario) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}

/** `/login` con sesión activa no tiene sentido: redirige directo al listado de cursos. */
function RutaSoloPublica({ children }: { children: ReactElement }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return <Cargando />
  if (usuario) return <Navigate to="/cursos" replace />
  return children
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="login"
        element={
          <RutaSoloPublica>
            <Suspense fallback={<Cargando />}>
              <LoginPage />
            </Suspense>
          </RutaSoloPublica>
        }
      />
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/cursos" replace />} />
        <Route
          path="cursos"
          element={
            <RutaProtegida>
              <Suspense fallback={<Cargando />}>
                <CursosPage />
              </Suspense>
            </RutaProtegida>
          }
        />
        <Route
          path="docentes"
          element={
            <RutaProtegida>
              <Suspense fallback={<Cargando />}>
                <DocentesPage />
              </Suspense>
            </RutaProtegida>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
