import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/FAVCREATORS/', // Set base for GitHub Pages subpath deployment
  build: {
    outDir: 'docs', // Build into docs folder for GitHub Pages compatibility
  }
})
