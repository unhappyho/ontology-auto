import { defineConfig } from 'vite'

export default defineConfig({
  base: '/factory/',
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
