import path from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite" // <-- Import the plugin
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss() // <-- Add it here
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://plastech-backend.runasp.net",
        changeOrigin: true,
      },
    },
  },
})