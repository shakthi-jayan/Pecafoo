import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/",

  plugins: [react()],

  optimizeDeps: {
    noDiscovery: true,
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react-router-dom',
      'axios',
      'leaflet',
      'react-leaflet',
      'framer-motion',
      'lucide-react',
      'react-hot-toast',
      'date-fns',
    ],
    exclude: ['firebase', 'recharts'],
  },

  server: {
    host: '0.0.0.0',
    port: 5173,

    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },

    watch: {
      usePolling: true,
    },

    proxy: {
      '/api': {
        target: 'http://136.185.11.23:8000',
        changeOrigin: true,
        secure: false,
      },

      '/media': {
        target: 'http://136.185.11.23:8000',
        changeOrigin: true,
        secure: false,
      },

      '/ws': {
        target: 'ws://136.185.11.23:8000',
        ws: true,
        changeOrigin: true,
      }
    }
  },

  preview: {
    host: '0.0.0.0',
    port: 3004,
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
