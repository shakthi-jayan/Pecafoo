import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/",
  appType: 'spa',

  plugins: [react()],

  // These are build-time environment variables
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || '/api'),
    'import.meta.env.VITE_WS_BASE_URL': JSON.stringify(process.env.VITE_WS_BASE_URL || '/ws'),
    'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(process.env.VITE_FIREBASE_API_KEY),
    'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.VITE_FIREBASE_AUTH_DOMAIN),
    'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(process.env.VITE_FIREBASE_PROJECT_ID),
    'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.VITE_FIREBASE_STORAGE_BUCKET),
    'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(process.env.VITE_FIREBASE_APP_ID),
    'import.meta.env.VITE_RESTAURANT_APP_URL': JSON.stringify(process.env.VITE_RESTAURANT_APP_URL || ''),
    'import.meta.env.VITE_CUSTOMER_APP_URL': JSON.stringify(process.env.VITE_CUSTOMER_APP_URL || ''),
    'import.meta.env.VITE_DELIVERY_APP_URL': JSON.stringify(process.env.VITE_DELIVERY_APP_URL || ''),
    'import.meta.env.VITE_ADMIN_APP_URL': JSON.stringify(process.env.VITE_ADMIN_APP_URL || ''),
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
      },
      '/ws': {
        target: 'ws://136.185.11.23:8000',
        ws: true,
      }
    }
  }
})
