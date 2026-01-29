import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      '/api/EvCharger': {
        target: 'https://apis.data.go.kr/B552584',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/EvCharger/, '/EvCharger'),
        secure: true,
      },
    },
  },
})
