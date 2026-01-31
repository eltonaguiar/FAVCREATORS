
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { setupProxy } from './src/api/proxy';

export default defineConfig({
  plugins: [
    react(),
    {
      name: "favcreators-proxy",
      configureServer(server) {
        setupProxy(server);
      },
    },
  ],
  base: '/FAVCREATORS/', // Correct base for GitHub Pages project site
  build: {
    outDir: 'docs',
  },
});
