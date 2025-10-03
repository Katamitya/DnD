import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/DND/', // Для GitHub Pages
  server: {
    host: '0.0.0.0',
    port: 8080,
    watch: {
      usePolling: true
    },
    cors: true,
    hmr: {
      host: 'localhost'
    },
    allowedHosts: 'all'
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})

