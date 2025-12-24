import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from 'node:path'
import tailwindcss from "@tailwindcss/vite"
import monacoEditorPluginModule from 'vite-plugin-monaco-editor';

const monacoEditorPlugin = (monacoEditorPluginModule as any).default;

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    monacoEditorPlugin({})
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
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
