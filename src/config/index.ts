import fs from 'node:fs';
import path from 'node:path';

import deepmerge from 'deepmerge';
import { UserConfig as ViteConfig } from 'vite';

export type VextRewriteConfig = {
  source: string;
  destination: string;
};

export type VextRedirectConfig = {
  source: string;
  destination: string;
  permanent: boolean;
};

export type VextHeaderConfig = {
  source: string;
  headers: { key: string; value: string }[];
};

export type VextBuildConfig = {
  alias?: Record<string, string>;
  jsxImportSource?: string;
  define?: Record<string, string>;
  vite?: ViteConfig | ((baseConfig: ViteConfig) => ViteConfig);
  swc?: {
    tsDecorators?: boolean;
    plugins?: [string, Record<string, unknown>][];
  };
};

export type VextConfig = {
  assetPrefix?: string;
  pageExtensions?: string[];
  root?: string;
  build?: VextBuildConfig;
  rewrites?: VextRewriteConfig[];
  redirects?: VextRedirectConfig[];
  headers?: VextHeaderConfig[];
};

export type InlineVextConfig = VextConfig & {
  configFile?: false | string;
};

export type ResolvedVextConfig = VextConfig & {
  root: string;
  pageExtensions: string[];
};

export const defineVextConfig = (config: VextConfig) => config;
export const readConfig = async (inlineConfig?: InlineVextConfig): Promise<ResolvedVextConfig> => {
  const configRoot = inlineConfig?.root ? path.resolve(inlineConfig.root, '..') : path.resolve('./');
  const configFile =
    inlineConfig?.configFile !== false ? path.join(configRoot, inlineConfig?.configFile ?? 'vext.config') : null;

  const configFileExtensions = ['', '.js', '.ts'];
  const configFileTargets =
    configFile !== null ? configFileExtensions.map(extension => `${configFile}${extension}`) : [];

  const config = await configFileTargets.reduce(
    (configPromise, configFileTarget) =>
      configPromise.catch(() =>
        fs.promises.access(configFileTarget).then(() => import(configFileTarget) as Promise<VextConfig>),
      ),
    Promise.resolve<VextConfig>({}),
  );

  const mergeOption = {
    arrayMerge: (_destination: unknown[], source: unknown[]) => source,
  };

  const mergedConfig = deepmerge(config, inlineConfig ?? {}, mergeOption) as VextConfig;
  return {
    ...mergedConfig,
    root: mergedConfig?.root ?? path.join(configRoot, './src'),
    pageExtensions: mergedConfig.pageExtensions ?? ['.tsx'],
  };
};
