import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/opensky-auth': {
        target: 'https://auth.opensky-network.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/opensky-auth/, '')
      },
      '/opensky-api': {
        target: 'https://opensky-network.org/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/opensky-api/, '')
      },
      '/aviationstack': {
        // Free plan often requires HTTP 
        target: 'http://api.aviationstack.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/aviationstack/, '')
      }
    }
  }
})
