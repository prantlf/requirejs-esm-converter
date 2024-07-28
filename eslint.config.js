import js from '@eslint/js'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node
      },
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  },
  {
    files: ['test/input/**/amd-*.js'],
    languageOptions: {
      globals: {
        define: 'readonly'
      }
    }
  }
]
