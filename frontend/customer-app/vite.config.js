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
      },
      '/media': {
        target: 'http://136.185.11.23:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://136.185.11.23:8000',
        ws: true,
      }
    }
  },
})
