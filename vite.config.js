import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import VueDevTools from 'vite-plugin-vue-devtools' // <-- Faltou esta linha!

export default defineConfig(({ mode }) => {
  return {
    base: './',
    plugins: [
      vue(),
      VueDevTools(),
      mode === 'electron' ? electron({ entry: 'electron/main.js' }) : null
    ].filter(Boolean)
  }
})