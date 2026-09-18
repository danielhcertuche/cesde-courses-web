/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base de la API. Sin valor, la aplicación usa `/api` y el proxy de desarrollo. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
