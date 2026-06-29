import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

console.log("=== VITE BUILD CONFIG ===");
console.log("VITE_FIREBASE_API_KEY:", process.env.VITE_FIREBASE_API_KEY);
console.log("VITE_FIREBASE_AUTH_DOMAIN:", process.env.VITE_FIREBASE_AUTH_DOMAIN);
console.log("=========================");

export default defineConfig({
  base: "/",
  appType: 'spa',

  plugins: [react()],

  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || 'https://api.pecafoo.com/api'),
    'import.meta.env.VITE_WS_BASE_URL': JSON.stringify(process.env.VITE_WS_BASE_URL || 'wss://api.pecafoo.com/ws'),
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://api.pecafoo.com',
        changeOrigin: true,
      },
      '/ws': {
        target: 'wss://api.pecafoo.com',
        ws: true,
      }
    }
  },

  preview: {
    port: 4173,
    proxy: {
      '/api': {
        target: 'https://api.pecafoo.com',
        changeOrigin: true,
      },
      '/ws': {
        target: 'wss://api.pecafoo.com',
        ws: true,
      }
    }
  }
})
