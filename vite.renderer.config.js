import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,tsx,js,ts}',
    }),
  ],
  root: '.',
  publicDir: 'public',
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  build: {
    outDir: '.vite/renderer',
    rollupOptions: {
      input: {
        main_window: './index.html',
      },
    },
  },
  server: {
    port: 3000,
  },
});
