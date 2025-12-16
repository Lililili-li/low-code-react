import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from 'node:path'
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // '@repo/core': resolve(__dirname, '../../packages/core'),
      // '@repo/ui': resolve(__dirname, '../../packages/ui'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8888,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
});
