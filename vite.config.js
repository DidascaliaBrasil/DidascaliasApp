import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'

export default defineConfig(({ mode }) => {
  return {
    base: './',
    plugins: [
      vue(),
      mode === 'electron' ? electron({ entry: 'electron/main.js' }) : null
    ].filter(Boolean)
  }
})