import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,         // Listen on all network interfaces
    allowedHosts: 'all', // Allow all hosts including ngrok / tunnels
    proxy: {
      // Proxy /api/* → FastAPI backend (strips the /api prefix)
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
