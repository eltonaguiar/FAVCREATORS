import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/FAVCREATORS/', // Correct base for GitHub Pages project site
  build: {
    outDir: 'docs',
  },
})
