import type { ReactNode } from 'react'
import './EmptyState.css'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  /** Se recibe ya construida (p. ej. un `<Button>`) en vez de `{label, onClick}`: evita duplicar el tipado de acción que ya tiene Button. */
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="ui-empty-state">
      {icon && (
        <div className="ui-empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="ui-empty-state__title">{title}</p>
      {description && <p className="ui-empty-state__description">{description}</p>}
      {action && <div className="ui-empty-state__action">{action}</div>}
    </div>
  )
}
