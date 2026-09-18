import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '@/ui'
import { AuthProvider } from '@/features/Auth/AuthContext'
import App from './App'
import './styles/base.css'

const container = document.getElementById('root')
if (!container) throw new Error('No se encontró el nodo raíz de la aplicación.')

// El proveedor de sesión va fuera del enrutador a propósito: la sesión no depende
// de la ruta activa, y así queda disponible para cualquier cosa que se monte
// alrededor del router en el futuro (splash screens, límites de error, etc.).
createRoot(container).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
