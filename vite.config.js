import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    https: {
      key: fs.readFileSync('./localhost+2-key.pem'),
      cert: fs.readFileSync('./localhost+2.pem'),
    },
    hmr: {
      overlay: false,
    },
  },
  base: '/spaceship-dodge-game/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  css: {
    postcss: './postcss.config.js',
  },
});