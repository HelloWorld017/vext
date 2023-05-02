import { resolve } from 'node:path';

import mdx from '@mdx-js/rollup';
import react from '@vitejs/plugin-react-swc';
import remarkGfm from 'remark-gfm';
import { defineConfig, PluginOption } from 'vite';
import svgr from 'vite-plugin-svgr';

import codebook from './src/vitePlugin';

const isProduction = process.env.NODE_ENV === 'production';
const env = isProduction ? 'prod' : 'dev';
const outDir = resolve(__dirname, 'dist/');

export default defineConfig({
  root: __dirname,
  build: {
    outDir,
    emptyOutDir: false,
    minify: isProduction,
    ssr: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
    },
    commonjsOptions: {
      include: [/node_modules/],
    },
    rollupOptions: {
      external: ['react', 'react-dom', /@emotion\/react/, /@emotion\/styled/],
      input: {
        index: resolve(__dirname, 'src/index.ts'),
        'vite-plugin': resolve(__dirname, 'src/vitePlugin.ts'),
      },
      output: [
        {
          format: 'es',
          dir: outDir,
          entryFileNames: `[name].${env}.js`,
          assetFileNames: `assets/[name]-[hash].${env}[extname]`,
          chunkFileNames: `chunks/chunk-[hash].${env}.js`,
        },
        {
          format: 'cjs',
          dir: outDir,
          entryFileNames: `[name].${env}.cjs`,
          assetFileNames: `assets/[name]-[hash].${env}[extname]`,
          chunkFileNames: `chunks/chunk-[hash].${env}.cjs`,
        },
      ],
    },
  },
  resolve: {
    alias: [{ find: /^@\//, replacement: `${resolve(__dirname, './src/')}/` }],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    __DEV__: JSON.stringify(!isProduction),
  },
  plugins: [
    mdx({ remarkPlugins: [remarkGfm] }) as PluginOption,
    codebook(),
    react({ jsxImportSource: '@emotion/react' }),
    svgr({
      exportAsDefault: false,
      svgrOptions: {
        svgoConfig: {
          plugins: {
            removeViewBox: false,
          },
        },
      },
    }),
  ],
});
