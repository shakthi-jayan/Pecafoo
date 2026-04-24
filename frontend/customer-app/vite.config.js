import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/",
  appType: 'spa',

  plugins: [react()],

  // These are build-time environment variables
  define: {
    // This makes env vars available at runtime
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || '/api'),
    'import.meta.env.VITE_WS_URL': JSON.stringify(process.env.VITE_WS_URL || '/ws'),
    'import.meta.env.VITE_APP_NAME': JSON.stringify(process.env.VITE_APP_NAME || 'Pecafoo'),
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
          maps: ['leaflet', 'react-leaflet'],
        }
      }
    }
  },

  server: {
    port: 5173,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
    proxy: {
      '/api': {
        target: 'http://136.185.11.23:8000',
        changeOrigin: true,
        rewrite: (path) => path,
      },
      '/ws': {
        target: 'ws://136.185.11.23:8000',
        ws: true,
      }
    }
  },

  preview: {
    port: 4173,
    proxy: {
      '/api': {
        target: 'http://136.185.11.23:8000',
        changeOrigin: true,
      }
    }
  }
})
