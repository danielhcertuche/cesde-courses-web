/**
 * Pantalla de acceso: escribe en `AuthContext` a través de `entrar`. Es la mitad
 * "escritura" de la demostración de comunicación entre componentes — la otra mitad
 * es `AppShell` (lee `usuario`/`salir`) y el enrutador (lee `usuario`/`cargando`).
 */
import { useState } from 'react'
import { useLocation, useNavigate, type Location } from 'react-router-dom'
import { Button, Field, Input } from '@/ui'
import { componer, crearValidador, requerido, useForm } from '@/shared/validation'
import { CREDENCIALES_DEMO, useAuth } from './AuthContext'
import './LoginPage.css'

type CredencialesFormulario = {
  usuario: string
  contrasena: string
}

const VALORES_INICIALES: CredencialesFormulario = { usuario: '', contrasena: '' }

const validar = crearValidador<CredencialesFormulario>({
  usuario: componer(requerido('Ingresa tu usuario.')),
  contrasena: componer(requerido('Ingresa tu contraseña.')),
})

/** A dónde volver tras entrar: la ruta protegida que redirigió aquí, o `/cursos` por defecto. */
function destinoTrasEntrar(location: Location): string {
  const estado = location.state as { from?: Location } | null
  if (!estado?.from) return '/cursos'
  return `${estado.from.pathname}${estado.from.search}`
}

function AvisoDemostrativo() {
  return (
    <div className="login-page__aviso">
      <p>
        Acceso de demostración: sólo compara estos datos con un valor fijo guardado en el
        navegador. No hay autenticación real en el servidor — sirve para mostrar el flujo de
        estado entre componentes, no para proteger nada.
      </p>
      <p className="login-page__credenciales">
        Usuario <strong>{CREDENCIALES_DEMO.usuario}</strong> · Contraseña{' '}
        <strong>{CREDENCIALES_DEMO.contrasena}</strong>
      </p>
    </div>
  )
}

export default function LoginPage() {
  const { entrar } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [errorCredenciales, setErrorCredenciales] = useState<string | null>(null)

  const form = useForm<CredencialesFormulario>({
    valoresIniciales: VALORES_INICIALES,
    validar,
    alEnviar: async (valores) => {
      const coincide = await entrar(valores)
      if (!coincide) {
        setErrorCredenciales('El usuario o la contraseña no coinciden con las credenciales de demostración.')
        return
      }
      navigate(destinoTrasEntrar(location), { replace: true })
    },
  })

  // El intento anterior ya no aplica una vez que el usuario vuelve a escribir.
  function editarCampo<K extends keyof CredencialesFormulario>(campo: K, valor: string) {
    setErrorCredenciales(null)
    form.handleChange(campo, valor)
  }

  return (
    <div className="login-page">
      <form className="login-page__card" onSubmit={form.handleSubmit} noValidate>
        <h1 className="login-page__title">Acceso</h1>
        <AvisoDemostrativo />

        <Field id="login-usuario" label="Usuario" required error={form.errores.usuario}>
          {(controlProps) => (
            <Input
              {...controlProps}
              size="md"
              autoComplete="username"
              value={form.valores.usuario}
              onChange={(evento) => editarCampo('usuario', evento.target.value)}
              onBlur={() => form.handleBlur('usuario')}
            />
          )}
        </Field>

        <Field
          id="login-contrasena"
          label="Contraseña"
          required
          error={form.errores.contrasena ?? errorCredenciales ?? undefined}
        >
          {(controlProps) => (
            <Input
              {...controlProps}
              size="md"
              type="password"
              autoComplete="current-password"
              value={form.valores.contrasena}
              onChange={(evento) => editarCampo('contrasena', evento.target.value)}
              onBlur={() => form.handleBlur('contrasena')}
            />
          )}
        </Field>

        <Button size="md" type="submit" fullWidth loading={form.enviando} disabled={!form.esValido}>
          Entrar
        </Button>
      </form>
    </div>
  )
}
