import { defineConfig } from 'vite'

export default defineConfig({
  base: '/xc007/',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    open: false,
  },
})
