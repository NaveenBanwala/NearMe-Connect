import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  define: {
    global: 'globalThis',  // ← fixes "global is not defined"
  },
  plugins: [react(), tailwindcss()],
  server: {
    host: 'localhost',
    port: 5173,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/ws/, '/api/ws'),
      },
    },
  },
})

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   server: {
//     host: 'localhost',
//     port: 5173,
//     hmr: {
//       protocol: 'ws',
//       host: 'localhost',
//       port: 5173,        // explicit clientPort keeps it clear
//     },
//     proxy: {
//       '/api': {
//         target: 'http://localhost:8082',
//         changeOrigin: true,
//       },
//       '/ws': {
//           target: 'http://localhost:8082',
//     changeOrigin: true,
//     ws: true,
//       },
//     },
//   },
// })