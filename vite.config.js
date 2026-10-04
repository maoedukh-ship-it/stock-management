import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'frontend',
  base: './',
  server: {
    port: 3000,
    open: false,
    host: true
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'frontend/index.html'),
        login: resolve(__dirname, 'frontend/login.html'),
        dashboard: resolve(__dirname, 'frontend/dashboard.html')
      }
    }
  }
});
