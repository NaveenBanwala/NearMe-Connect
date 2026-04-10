import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    hmr: { port: 5173 },
    proxy: {
      '/api': {
        target: 'http://localhost:8082',  // was 8080 — that's Jenkins, not Spring
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8082',    // same fix for WebSocket
        ws: true,
        changeOrigin: true,
      },
    },
  },
})