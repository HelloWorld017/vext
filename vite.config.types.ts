import { resolve } from 'node:path';

import dts from 'rollup-plugin-dts';
import { defineConfig, Plugin } from 'vite';

const root = resolve(__dirname, './dist/types');
export default defineConfig({
  build: {
    ssr: true,
    emptyOutDir: false,
    lib: {
      entry: resolve(root, 'index.d.ts'),
      formats: ['es'],
    },
    commonjsOptions: {
      include: [/node_modules/],
    },
    rollupOptions: {
      external: ['react', 'react-dom', /@emotion\/react/, /@emotion\/styled/],
      input: {
        index: resolve(root, 'index.d.ts'),
        'vite-plugin': resolve(root, 'vitePlugin.d.ts'),
      },
      output: [
        {
          format: 'es',
          dir: resolve(__dirname, 'dist/'),
          entryFileNames: '[name].d.ts',
        },
      ],
    },
  },
  esbuild: false,
  resolve: {
    alias: [{ find: /^@\//, replacement: `${root}/` }],
  },
  plugins: [dts() as unknown as Plugin],
});
