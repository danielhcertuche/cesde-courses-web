/**
 * Concatenador mínimo de clases. No se instala una librería (`clsx`) para
 * resolver algo que es un `filter + join` de una línea.
 */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
