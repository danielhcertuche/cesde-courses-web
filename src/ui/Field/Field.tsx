import type { ReactNode } from 'react'
import './Field.css'

/**
 * Contrato que recibe la función hija de `Field`. Se entrega en vez de clonar
 * el control con `cloneElement` porque así el tipado queda exacto sin `any`:
 * el consumidor decide qué control renderizar y le reparte estas props.
 */
export interface FieldControlProps {
  id: string
  invalid: boolean
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  'aria-required'?: boolean
}

export interface FieldProps {
  id: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: (controlProps: FieldControlProps) => ReactNode
}

export function Field({ id, label, hint, error, required = false, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  const controlProps: FieldControlProps = {
    id,
    invalid: Boolean(error),
    'aria-describedby': describedBy,
    'aria-invalid': Boolean(error),
    'aria-required': required,
  }

  return (
    <div className="ui-field">
      <label className="ui-field__label" htmlFor={id}>
        {label}
        {required && (
          <span className="ui-field__required" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {children(controlProps)}
      {hint && !error && (
        <p className="ui-field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="ui-field__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
