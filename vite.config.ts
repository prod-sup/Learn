import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('postprocessing')) return 'three'
            if (id.includes('@react-three')) return 'r3f'
            if (id.includes('gsap')) return 'gsap'
            if (id.includes('react')) return 'react'
          }
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
})
