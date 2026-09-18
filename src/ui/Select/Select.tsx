import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { cx } from '../shared/cx'
import type { ControlSize } from '../shared/controlSize'
import { ChevronIcon } from '../icons'
import './Select.css'

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size: ControlSize
  invalid?: boolean
}

// El wrapper es necesario porque el triángulo nativo del <select> no se puede
// recolorear de forma consistente entre navegadores: se apaga con
// `appearance: none` y se dibuja el propio chevron encima.
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { size, invalid = false, className, children, ...rest },
  ref,
) {
  return (
    <span className={cx('ui-select', `ui-select--${size}`)}>
      <select
        ref={ref}
        className={cx('ui-select__control', invalid && 'ui-select__control--invalid', className)}
        aria-invalid={invalid || undefined}
        {...rest}
      >
        {children}
      </select>
      <ChevronIcon className="ui-select__chevron" size={14} />
    </span>
  )
})
