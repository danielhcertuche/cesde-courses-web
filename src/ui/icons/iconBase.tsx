import type { SVGProps } from 'react'

/** Tamaño por defecto en píxeles: coincide con la altura de línea del texto base. */
export const ICON_DEFAULT_SIZE = 16

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number
}

/**
 * Atributos comunes a todos los glifos: trazo con `currentColor` para heredar
 * el color del texto circundante y `aria-hidden` porque el significado lo da
 * siempre el texto o el `aria-label` del control que envuelve al icono.
 */
export function iconBaseProps(size: number) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': 'true' as const,
  }
}
