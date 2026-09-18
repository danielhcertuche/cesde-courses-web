import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../shared/cx'
import type { ControlSize } from '../shared/controlSize'
import { Spinner } from '../Spinner/Spinner'
import './Button.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  size: ControlSize
  variant?: ButtonVariant
  iconLeft?: ReactNode
  iconRight?: ReactNode
  /** Deshabilita el botón y sustituye el icono izquierdo por un spinner sin mover el layout. */
  loading?: boolean
  fullWidth?: boolean
  children: ReactNode
}

export function Button({
  size,
  variant = 'primary',
  iconLeft,
  iconRight,
  loading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx('ui-button', `ui-button--${variant}`, `ui-button--${size}`, fullWidth && 'ui-button--full', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : (
        iconLeft && (
          <span className="ui-button__icon" aria-hidden="true">
            {iconLeft}
          </span>
        )
      )}
      <span className="ui-button__label">{children}</span>
      {iconRight && !loading && (
        <span className="ui-button__icon" aria-hidden="true">
          {iconRight}
        </span>
      )}
    </button>
  )
}
