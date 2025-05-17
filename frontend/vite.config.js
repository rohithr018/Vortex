import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    host: true,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        secure: false,
      }
    }
  },
  plugins: [
    tailwindcss(),
    react()],
})
