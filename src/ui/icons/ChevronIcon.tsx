import { ICON_DEFAULT_SIZE, iconBaseProps, type IconProps } from './iconBase'

export type ChevronDirection = 'up' | 'down' | 'left' | 'right'

export interface ChevronIconProps extends IconProps {
  direction?: ChevronDirection
}

/**
 * Un solo trazo rotado por CSS en vez de cuatro variantes de path: menos
 * superficie para desincronizar cuando cambie el diseño del glifo.
 */
const ROTATION_DEG: Record<ChevronDirection, number> = {
  down: 0,
  up: 180,
  left: 90,
  right: -90,
}

export function ChevronIcon({ size = ICON_DEFAULT_SIZE, direction = 'down', style, ...rest }: ChevronIconProps) {
  return (
    <svg
      {...iconBaseProps(size)}
      style={{ ...style, transform: `rotate(${ROTATION_DEG[direction]}deg)`, transition: 'transform var(--c-transition)' }}
      {...rest}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
