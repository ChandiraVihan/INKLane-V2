import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb'],

  // --- ADD THIS ENTIRE BLOCK ---
  // This tells the Vite development server how to handle API requests.
  server: {
    proxy: {
      // Any request starting with "/api" will be forwarded to the target.
      '/api': {
        // Your Express server is running on localhost port 3001
        target: 'http://localhost:3001',
        // This is a required setting to prevent certain errors
        changeOrigin: true,
      },
    }
  },
  // --- END OF BLOCK TO ADD ---
})
