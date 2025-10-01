import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // '/api' ile başlayan tüm istekleri localhost:3000'e yönlendir
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})