import { cx } from '../shared/cx'
import './Spinner.css'

export type SpinnerSize = 'sm' | 'md' | 'lg'

export interface SpinnerProps {
  size?: SpinnerSize
  /** Texto accesible. Sin él, el spinner se asume decorativo (p. ej. dentro de un Button que ya anuncia `aria-busy`). */
  label?: string
  className?: string
}

export function Spinner({ size = 'md', label, className }: SpinnerProps) {
  return (
    <span className={cx('ui-spinner', `ui-spinner--${size}`, className)} role={label ? 'status' : undefined} aria-hidden={label ? undefined : 'true'}>
      <svg viewBox="0 0 24 24" fill="none">
        <circle className="ui-spinner__track" cx="12" cy="12" r="9" strokeWidth="3" />
        <circle className="ui-spinner__head" cx="12" cy="12" r="9" strokeWidth="3" />
      </svg>
      {label && <span className="ui-spinner__label">{label}</span>}
    </span>
  )
}
