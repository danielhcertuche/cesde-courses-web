import { Outlet } from 'react-router-dom'

/**
 * Armazón de la aplicación: barra superior, navegación y área de contenido.
 * Responsive por punto de quiebre — nav lateral ≥1024px, rail de iconos entre
 * 640 y 1024px, menú superior por debajo.
 */
export function AppShell() {
  return (
    <div className="app-shell">
      <main className="app-shell__content">
        <Outlet />
      </main>
    </div>
  )
}
