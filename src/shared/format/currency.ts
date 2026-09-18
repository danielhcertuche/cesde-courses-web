/**
 * Formato de moneda para pantalla y su inverso para inputs de texto. El dominio guarda
 * `precio` como número plano (sin símbolo ni separadores); esta es la única capa que conoce
 * el formato es-CO.
 */

const FORMATEADOR_COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})

/** `1850000` -> `"$ 1.850.000"`. Sin decimales: el peso colombiano no los usa en pantalla. */
export function formatearCOP(valor: number): string {
  if (!Number.isFinite(valor)) return ''
  return FORMATEADOR_COP.format(valor)
}

/**
 * Inverso aproximado de `formatearCOP`, tolerante a lo que el usuario escribe en el input:
 * símbolo de moneda, separador de miles `.` y coma decimal, ambos es-CO. No es un parser
 * general: basta para un campo de precio con un solo valor numérico. Devuelve `null` si no
 * queda ningún número reconocible.
 */
export function parsearCOP(texto: string): number | null {
  const limpio = texto
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '') // separador de miles es-CO
    .replace(',', '.') // coma decimal es-CO -> punto

  if (limpio.trim() === '') return null
  const numero = Number(limpio)
  return Number.isFinite(numero) ? numero : null
}
