/**
 * Compuerta de accesibilidad: comprueba las razones de contraste declaradas en
 * docs/manual-de-marca.md contra los valores reales de src/styles/tokens.css.
 *
 * Existe porque un manual que nadie verifica se desincroniza del código en
 * semanas, y un cambio de color aparentemente inocuo puede dejar un control
 * por debajo del mínimo sin que nadie lo note en la revisión.
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'

const TOKENS = fileURLToPath(new URL('../src/styles/tokens.css', import.meta.url))

/** Pares tal como la interfaz los usa. Mínimos de WCAG 2.2: 4.5:1 en texto, 3:1 en bordes de control. */
const PARES = [
  ['borde de control', '--c-border-control', '--c-surface', 3],
  ['borde de control hover', '--c-border-control-hover', '--c-surface', 3],
  ['anillo de foco', '--c-border-focus', '--c-surface', 3],
  ['exito sobre su fondo', '--c-success', '--c-success-soft', 4.5],
  ['aviso sobre su fondo', '--c-warning', '--c-warning-soft', 4.5],
  ['peligro sobre su fondo', '--c-danger', '--c-danger-soft', 4.5],
  ['texto secundario', '--c-text-muted', '--c-surface', 4.5],
  ['texto secundario sobre gris', '--c-text-muted', '--c-surface-muted', 4.5],
  ['texto principal', '--c-text', '--c-surface', 4.5],
  ['texto inverso sobre marca', '--c-text-inverse', '--c-primary', 4.5],
]

function luminancia(hex) {
  const canales = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const [r, g, b] = canales.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function razon(a, b) {
  const [alta, baja] = [luminancia(a), luminancia(b)].sort((x, y) => y - x)
  return (alta + 0.05) / (baja + 0.05)
}

const css = await readFile(TOKENS, 'utf8')
const tokens = Object.fromEntries([...css.matchAll(/(--c-[\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]))

let fallos = 0
for (const [nombre, frente, fondo, minimo] of PARES) {
  if (!tokens[frente] || !tokens[fondo]) {
    console.error(`FALTA  ${nombre}: token no definido (${frente} o ${fondo})`)
    fallos += 1
    continue
  }
  const valor = razon(tokens[frente], tokens[fondo])
  const ok = valor >= minimo
  if (!ok) fallos += 1
  console.log(
    `${ok ? 'OK   ' : 'FALLA'}  ${nombre.padEnd(28)} ${valor.toFixed(2)}:1  (mínimo ${minimo}:1)`,
  )
}

if (fallos > 0) {
  console.error(`\n${fallos} par(es) por debajo del mínimo. Corrige el token o el manual.`)
  process.exit(1)
}
console.log('\nTodos los pares cumplen WCAG 2.2 AA.')
