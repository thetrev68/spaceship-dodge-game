import { defineConfig } from 'vite';
import fs from 'fs';

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    https: {
      key: fs.readFileSync('./localhost+2-key.pem'),
      cert: fs.readFileSync('./localhost+2.pem'),
    },
    hmr: {
      overlay: false, // Disable error overlay for cleaner debugging
    },
  },
  base: '/spaceship-dodge-game/',
  build: {
    outDir: 'dist', // Ensure this is the output directory for your build
    assetsDir: 'assets', // Ensure your assets are correctly referenced
  },
  css: {
    postcss: './postcss.config.js',
  },
});