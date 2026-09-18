import { ICON_DEFAULT_SIZE, iconBaseProps, type IconProps } from './iconBase'

export function SearchIcon({ size = ICON_DEFAULT_SIZE, ...rest }: IconProps) {
  return (
    <svg {...iconBaseProps(size)} {...rest}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.2" y2="16.2" />
    </svg>
  )
}
