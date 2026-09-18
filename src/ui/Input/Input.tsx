import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cx } from '../shared/cx'
import type { ControlSize } from '../shared/controlSize'
import './Input.css'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size: ControlSize
  /** Estado de error visual. `Field` lo deriva de la presencia del mensaje, no hace falta duplicarlo a mano. */
  invalid?: boolean
}

// forwardRef porque `useForm` (capa de validación) necesita enfocar el primer campo inválido al fallar el submit.
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size, invalid = false, className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cx('ui-input', `ui-input--${size}`, invalid && 'ui-input--invalid', className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
})
