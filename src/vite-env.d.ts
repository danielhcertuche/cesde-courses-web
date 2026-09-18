/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * URL base de la API cuando el frontend habla con un backend propio en otro
   * origen (json-server u otro). Sin valor, la aplicación usa `/api` y el
   * proxy de desarrollo. Se ignora por completo en modo demo.
   */
  readonly VITE_API_URL?: string
  /** `'demo'` activa el backend simulado en el navegador (`api/demo/`) en vez de `fetch`. Usado por el build publicado en GitHub Pages. */
  readonly VITE_API_MODE?: 'demo'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
