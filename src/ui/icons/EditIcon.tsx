import { ICON_DEFAULT_SIZE, iconBaseProps, type IconProps } from './iconBase'

export function EditIcon({ size = ICON_DEFAULT_SIZE, ...rest }: IconProps) {
  return (
    <svg {...iconBaseProps(size)} {...rest}>
      <path d="M12.5 5.5l6 6L8 22H2v-6l10.5-10.5z" />
      <line x1="11" y1="7" x2="17" y2="13" />
    </svg>
  )
}
