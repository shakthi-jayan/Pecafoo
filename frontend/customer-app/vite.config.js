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
    resolve: { alias: { "@api": path.resolve(__dirname, "src/services/api"), "axios": path.resolve(__dirname, "node_modules/axios"), "date-fns": path.resolve(__dirname, "node_modules/date-fns"), "firebase": path.resolve(__dirname, "node_modules/firebase"), "framer-motion": path.resolve(__dirname, "node_modules/framer-motion"), "leaflet": path.resolve(__dirname, "node_modules/leaflet"), "lucide-react": path.resolve(__dirname, "node_modules/lucide-react"), "react": path.resolve(__dirname, "node_modules/react"), "react-dom": path.resolve(__dirname, "node_modules/react-dom"), "react-hot-toast": path.resolve(__dirname, "node_modules/react-hot-toast"), "react-leaflet": path.resolve(__dirname, "node_modules/react-leaflet"), "react-router-dom": path.resolve(__dirname, "node_modules/react-router-dom"), "recharts": path.resolve(__dirname, "node_modules/recharts"),  "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime") } },
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




