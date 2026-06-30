import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  console.log("=== VITE BUILD CONFIG ===");
  console.log("API_KEY length:", env.VITE_FIREBASE_API_KEY ? env.VITE_FIREBASE_API_KEY.length : 0);
  console.log("API_KEY value:", env.VITE_FIREBASE_API_KEY ? env.VITE_FIREBASE_API_KEY.substring(0, 5) + "..." : "UNDEFINED");
  console.log("=========================");

  return {
    plugins: [react()],
    
        
    base: "/",
    build: {
      outDir: "dist",
      sourcemap: false,
    },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: "https://api.pecafoo.com",
          changeOrigin: true,
        },
        "/ws": {
          target: "wss://api.pecafoo.com",
          ws: true,
        },
      },
    },
    preview: {
      port: 4173,
      proxy: {
        "/api": {
          target: "https://api.pecafoo.com",
          changeOrigin: true,
        },
        "/ws": {
          target: "wss://api.pecafoo.com",
          ws: true,
        },
      }
    }
  };
});
