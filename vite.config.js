import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // Bind on all interfaces so localhost/127.0.0.1/LAN access all work reliably.
    host: true,
    port: 5173,
    strictPort: true,
  },
})
