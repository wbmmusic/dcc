import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    browserField: false,
    conditions: ['node'],
    mainFields: ['module', 'jsnext:main', 'jsnext']
  },
  build: {
    rollupOptions: {
      external: [
        'serialport',
        '@serialport/parser-byte-length',
        '@serialport/parser-inter-byte-timeout',
        'usb',
        'electron',
        'electron-updater',
        'archiver',
        'adm-zip',
      ],
    },
  },
});
