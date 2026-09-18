import { useEffect, useState, type ReactElement } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import './AppShell.css'

interface NavItem {
  to: string
  label: string
  icon: ReactElement
}

// Fuente única de las dos entradas de navegación: alimenta tanto el nav
// lateral/rail como el menú desplegable móvil, así nunca se desincronizan.
const NAV_ITEMS: NavItem[] = [
  { to: '/cursos', label: 'Cursos', icon: <IconCursos /> },
  { to: '/docentes', label: 'Docentes', icon: <IconDocentes /> },
]

/**
 * Armazón de la aplicación: barra superior, navegación y área de contenido
 * con scroll propio. Responsive por punto de quiebre — nav lateral fijo
 * ≥1024px, rail de iconos entre 640 y 1024px, menú desplegable en la barra
 * superior por debajo de 640px (ver AppShell.css).
 */
export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)

  useCloseOnEscape(menuOpen, () => {
    setMenuOpen(false)
    document.getElementById('app-shell-menu-toggle')?.focus()
  })
  // Si el menú móvil quedó abierto y el viewport crece hasta mostrar el nav
  // lateral, se cierra para no dejar dos landmarks "nav" activos a la vez.
  useCloseOnWideViewport(() => setMenuOpen(false))

  return (
    <div className="app-shell">
      <TopBar menuOpen={menuOpen} onToggle={() => setMenuOpen((open) => !open)} />

      {menuOpen && (
        <nav id="app-shell-mobile-nav" className="app-shell__mobile-nav" aria-label="Menú de navegación">
          <NavLinks onNavigate={() => setMenuOpen(false)} />
        </nav>
      )}

      <div className="app-shell__body">
        <nav className="app-shell__nav" aria-label="Principal">
          <NavLinks />
        </nav>
        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function TopBar({ menuOpen, onToggle }: { menuOpen: boolean; onToggle: () => void }) {
  return (
    <header className="app-shell__topbar">
      <button
        id="app-shell-menu-toggle"
        type="button"
        className="app-shell__menu-toggle"
        aria-expanded={menuOpen}
        aria-controls="app-shell-mobile-nav"
        aria-label={menuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
        onClick={onToggle}
      >
        {menuOpen ? <IconClose /> : <IconMenu />}
      </button>
      <h1 className="app-shell__title">Cursos Cesde</h1>
    </header>
  )
}

/** Enlaces compartidos por el nav lateral/rail y el menú móvil. */
function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className="app-shell__nav-list">
      {NAV_ITEMS.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'app-shell__nav-link app-shell__nav-link--active' : 'app-shell__nav-link'
            }
            onClick={onNavigate}
          >
            {item.icon}
            <span className="app-shell__nav-label">{item.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

/** Cierra el menú móvil con Esc y devuelve el foco al botón que lo abrió. */
function useCloseOnEscape(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onClose se recrea cada render a propósito
  }, [active])
}

/** Ejecuta `onWide` cuando el viewport cruza a ≥640px (fin del layout móvil). */
function useCloseOnWideViewport(onWide: () => void) {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 640px)')
    mediaQuery.addEventListener('change', onWide)
    return () => mediaQuery.removeEventListener('change', onWide)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- se registra una sola vez
  }, [])
}

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconCursos() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        d="M4 5.5C4 4.7 4.7 4 5.5 4H16a2 2 0 0 1 2 2v14l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3V5.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconDocentes() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
