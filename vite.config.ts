import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron/simple'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: {
          define: {
            __dirname: 'import.meta.dirname',
            __filename: 'import.meta.filename',
          },
          build: {
            rollupOptions: {
              external: ['better-sqlite3', 'node-pty', 'simple-git', 'execa'],
            },
          },
        },
      },
      preload: {
        input: 'electron/preload.mjs',
      },
    }),
  ],
  // Tauri expects a fixed port in dev mode
  server: {
    port: 1420,
    strictPort: true,
    open: false,
  },
  // Tauri uses the built files from this directory
  build: {
    target: 'esnext',
  },
})
