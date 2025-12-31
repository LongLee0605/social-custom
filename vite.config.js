import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copyFileSync } from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-service-worker',
      buildStart() {
        // Copy service worker to public during dev
        try {
          copyFileSync('public/sw.js', 'dist/sw.js')
        } catch (e) {
          // Ignore if file doesn't exist
        }
      },
      writeBundle() {
        // Copy service worker after build
        try {
          copyFileSync('public/sw.js', 'dist/sw.js')
        } catch (e) {
          // Ignore if file doesn't exist
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  publicDir: 'public',
})

