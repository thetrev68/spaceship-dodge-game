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
  base: '/',
  css: {
    postcss: './postcss.config.js',
  },
});