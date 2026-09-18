import type { ReactNode } from 'react'
import { cx } from '../shared/cx'
import './Badge.css'

export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

export interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return <span className={cx('ui-badge', `ui-badge--${variant}`, className)}>{children}</span>
}
