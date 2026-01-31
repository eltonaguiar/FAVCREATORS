import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Use relative base so production build works from any path
  build: {
    outDir: 'docs',
  },
})
