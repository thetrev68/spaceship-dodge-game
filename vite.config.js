import { defineConfig } from 'vite';
import fs from 'fs';

export default defineConfig({
  server: {
    host: true, // Expose to network for iPhone testing
    port: 5173, // Explicit port
    https: {
      key: fs.readFileSync('./localhost+2-key.pem'),
      cert: fs.readFileSync('./localhost+2.pem'),
    },
  },
  base: '/', // Ensure consistent asset paths
  css: {
    postcss: './postcss.config.js', // Enable PostCSS for Tailwind
  },
});