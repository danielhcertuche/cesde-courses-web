import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { cx } from '../shared/cx'
import type { ControlSize } from '../shared/controlSize'
import './Textarea.css'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** No cambia la altura del control (crece con `rows`), pero se exige explícita por consistencia con el resto de la familia de formulario. */
  size: ControlSize
  invalid?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { size, invalid = false, className, rows = 4, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cx('ui-textarea', `ui-textarea--${size}`, invalid && 'ui-textarea--invalid', className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
})
