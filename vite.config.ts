import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/FAVCREATORS/', // Use repository name as base for GitHub Pages
  build: {
    outDir: 'docs',
  },
})
