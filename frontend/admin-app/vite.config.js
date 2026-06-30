import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/",
  appType: 'spa',

  

  plugins: [
    react(),
    {
      name: 'spa-fallback',
      configurePreviewServer(server) {
        return () => {
          server.middlewares.use((req, res, next) => {
            if (req.url && !req.url.startsWith('/@') && !req.url.includes('.')) {
              req.url = '/index.html';
            }
            next();
          });
        };
      },
    },
  ],

  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || 'https://api.pecafoo.com/api'),
    'import.meta.env.VITE_WS_BASE_URL': JSON.stringify(process.env.VITE_WS_BASE_URL || 'wss://api.pecafoo.com/ws'),
  },

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
        target: 'https://api.pecafoo.com',
        changeOrigin: true,
        secure: false,
      },

      '/media': {
        target: 'https://api.pecafoo.com',
        changeOrigin: true,
        secure: false,
      },

      '/ws': {
        target: 'wss://api.pecafoo.com',
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
