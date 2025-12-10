import { defineConfig } from 'vite';
import { builtinModules } from 'module';

export default defineConfig({
  resolve: {
    browserField: false,
    conditions: ['node'],
    mainFields: ['module', 'jsnext:main', 'jsnext']
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      external: [
        'electron',
        // Native modules must be external - they'll be loaded from node_modules at runtime
        'serialport',
        'usb',
        '@serialport/bindings-cpp',
        '@serialport/parser-byte-length',
        '@serialport/parser-inter-byte-timeout',
        '@serialport/parser-readline',
        '@serialport/stream',
        'bindings',
        'electron-updater',
        // All Node.js built-ins
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
      ],
      output: {
        format: 'cjs',
      }
    },
  },
});
