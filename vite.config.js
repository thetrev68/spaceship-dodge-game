import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './src/core'),
      '@game': path.resolve(__dirname, './src/game'),
      '@entities': path.resolve(__dirname, './src/entities'),
      '@systems': path.resolve(__dirname, './src/systems'),
      '@input': path.resolve(__dirname, './src/input'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@effects': path.resolve(__dirname, './src/effects'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    host: true,
    port: 5173,
    // https: {
    //   key: fs.readFileSync('./localhost+2-key.pem'),
    //   cert: fs.readFileSync('./localhost+2.pem'),
    // },
    hmr: {
      overlay: false,
    },
  },
  base: '/spaceship-dodge-game/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
});