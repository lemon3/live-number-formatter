/* global __dirname */
import { resolve } from 'path';
import { defineConfig } from 'vite';

import banner from 'vite-plugin-banner';
import pkg from './package.json';

const bannerText = `/*!
* LiveNumberFormatter v${pkg.version}
* ${pkg.homepage}
*/`;

export default defineConfig({
  build: {
    target: 'es2015', // esnext
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'LiveNumberFormatter',
      fileName: (format) => {
        const form = 'es' === format ? '' : `.${format}`;
        return `live-number-formatter${form}.js`;
      },
    },
    copyPublicDir: false,
  },

  test: {
    globals: true,
    environment: 'jsdom',
  },

  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, 'src'),
      },
    ],
  },

  plugins: [banner(bannerText)],
});
