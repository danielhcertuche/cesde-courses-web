import { ICON_DEFAULT_SIZE, iconBaseProps, type IconProps } from './iconBase'

export function PlusIcon({ size = ICON_DEFAULT_SIZE, ...rest }: IconProps) {
  return (
    <svg {...iconBaseProps(size)} {...rest}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
