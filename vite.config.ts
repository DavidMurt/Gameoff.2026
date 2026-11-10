import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5500,
    open: true, // Automatically open browser
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': '/src', // Shortcut for imports from src
    },
  },
});