import react from '@vitejs/plugin-react-swc';
import deepmerge from 'deepmerge';
import { UserConfig } from 'vite';

import { ResolvedVextConfig } from '@/config';
import { vextPlugin } from './vitePlugin';

export const getViteConfig = (vextConfig: ResolvedVextConfig) => {
  const generatedViteConfig: UserConfig = {
    base: vextConfig.assetPrefix,
    define: vextConfig.build?.define,
    resolve: {
      alias: vextConfig.build?.alias,
    },
    plugins: [
      react({
        jsxImportSource: vextConfig.build?.jsxImportSource,
        plugins: vextConfig.build?.swc?.plugins,
        tsDecorators: vextConfig.build?.swc?.tsDecorators,
      }),
      vextPlugin(vextConfig),
    ],
  };

  const extendedViteConfig =
    typeof vextConfig.build?.vite === 'function'
      ? vextConfig.build.vite(generatedViteConfig)
      : deepmerge(generatedViteConfig, vextConfig.build?.vite || {});

  return extendedViteConfig;
};
