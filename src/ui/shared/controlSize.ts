/**
 * Escala de altura de control (spec §5): `sm` para el cromo (barra de filtros,
 * acciones de tabla) y `md` para los formularios de captura. La comparten
 * Button, Input, Select y Textarea. Sin valor por defecto: cada consumidor
 * debe decidir cuál usa, así no se cuela un tamaño implícito.
 */
export type ControlSize = 'sm' | 'md'
