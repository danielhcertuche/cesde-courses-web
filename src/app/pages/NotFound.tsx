import { Link } from 'react-router-dom'

/** Página comodín para cualquier ruta que no exista. */
export function NotFound() {
  return (
    <section className="not-found" aria-labelledby="not-found-title">
      <p className="not-found__code">404</p>
      <h2 id="not-found-title">No encontramos esa página</h2>
      <p>La ruta que buscas no existe o fue movida.</p>
      <Link to="/cursos" className="not-found__link">
        Volver a Cursos
      </Link>
    </section>
  )
}
