import { ICON_DEFAULT_SIZE, iconBaseProps, type IconProps } from './iconBase'

export function AlertIcon({ size = ICON_DEFAULT_SIZE, ...rest }: IconProps) {
  return (
    <svg {...iconBaseProps(size)} {...rest}>
      <path d="M12 3 2 20h20L12 3z" />
      <line x1="12" y1="9" x2="12" y2="14" />
      <circle cx="12" cy="17.3" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}
