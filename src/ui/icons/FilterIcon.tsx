import { ICON_DEFAULT_SIZE, iconBaseProps, type IconProps } from './iconBase'

export function FilterIcon({ size = ICON_DEFAULT_SIZE, ...rest }: IconProps) {
  return (
    <svg {...iconBaseProps(size)} {...rest}>
      <path d="M4 4h16l-6 8v7l-4 2v-9L4 4z" />
    </svg>
  )
}
