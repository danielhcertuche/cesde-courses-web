import { ICON_DEFAULT_SIZE, iconBaseProps, type IconProps } from './iconBase'

export function CloseIcon({ size = ICON_DEFAULT_SIZE, ...rest }: IconProps) {
  return (
    <svg {...iconBaseProps(size)} {...rest}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  )
}
