import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// `base` sólo en el build: GitHub Pages sirve el sitio bajo /<repo>/, mientras
// que en desarrollo la aplicación vive en la raíz del servidor de Vite.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/cesde-courses-web/' : '/',
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    // La SPA llama a /api y Vite reenvía a json-server: el origen es uno solo
    // en desarrollo, así no hay CORS ni una URL base distinta por entorno.
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, '') },
    },
  },
}))
