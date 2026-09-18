import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'server', 'eslint.config.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      // Conjunto clásico de reglas de hooks. Se omiten a propósito las reglas de la
      // era del compilador (set-state-in-effect y afines): penalizan obtener datos
      // dentro de un efecto, que es justamente el patrón correcto en un proyecto que
      // no usa librería de datos. Silenciarlas archivo por archivo sería peor.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // El proyecto tipa su dominio: un `any` aquí es una decisión, no un descuido,
      // y debe justificarse en revisión antes que silenciarse archivo por archivo.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
    },
  },
)
