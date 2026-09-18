import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/app/layout/AppShell'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/cursos" replace />} />
        {/* Las páginas de Cursos y Docentes se montan aquí (fase 2 del plan). */}
      </Route>
    </Routes>
  )
}
