/**
 * Contexto de sesión. Existe para demostrar comunicación entre componentes y rutas
 * protegidas, no para proteger nada: `entrar` compara contra una constante visible en
 * `LoginPage`, sin backend, sin hash y sin token. `AppShell` lee `usuario` y `salir`;
 * el enrutador lee `usuario` y `cargando` para decidir si deja pasar o redirige.
 */
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

export interface Credenciales {
  usuario: string
  contrasena: string
}

/**
 * Únicas credenciales que este acceso reconoce. Se muestran a propósito en `LoginPage`:
 * quien evalúe debe poder entrar sin preguntar, porque no hay nada real que descubrir.
 */
export const CREDENCIALES_DEMO: Credenciales = { usuario: 'admin', contrasena: 'cesde2026' }

const CLAVE_ALMACENAMIENTO = 'cesde-courses-web:usuario'

export interface AuthContextValue {
  usuario: string | null
  cargando: boolean
  entrar: (credenciales: Credenciales) => Promise<boolean>
  salir: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Lectura defensiva: navegación privada o cuota agotada no deben romper el arranque. */
function leerUsuarioGuardado(): string | null {
  try {
    return window.localStorage.getItem(CLAVE_ALMACENAMIENTO)
  } catch {
    return null
  }
}

function guardarUsuario(usuario: string | null): void {
  try {
    if (usuario) window.localStorage.setItem(CLAVE_ALMACENAMIENTO, usuario)
    else window.localStorage.removeItem(CLAVE_ALMACENAMIENTO)
  } catch {
    // Si el almacenamiento falla, la sesión sigue viva en memoria para esta pestaña;
    // simplemente no sobrevive a un refresco.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<string | null>(() => leerUsuarioGuardado())
  const [cargando, setCargando] = useState(false)

  const entrar = useCallback(async (credenciales: Credenciales): Promise<boolean> => {
    setCargando(true)
    try {
      // Comparación directa, declarada como tal: nada de cifrado simulado ni de token.
      // Se recortan los extremos porque las credenciales están publicadas en la
      // propia pantalla y se copian y pegan: un espacio invisible al final no
      // debe leerse como credencial equivocada.
      const coincide =
        credenciales.usuario.trim() === CREDENCIALES_DEMO.usuario &&
        credenciales.contrasena.trim() === CREDENCIALES_DEMO.contrasena
      if (coincide) {
        setUsuario(CREDENCIALES_DEMO.usuario)
        guardarUsuario(CREDENCIALES_DEMO.usuario)
      }
      return coincide
    } finally {
      setCargando(false)
    }
  }, [])

  const salir = useCallback(() => {
    setUsuario(null)
    guardarUsuario(null)
  }, [])

  return <AuthContext.Provider value={{ usuario, cargando, entrar, salir }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>.')
  return contexto
}
