import path from 'node:path/posix';

import fastGlob from 'fast-glob';
import micromatch from 'micromatch';
import { Plugin } from 'vite';

import { ResolvedVextConfig } from '@/config';
import { PAGES_DIRECTORY_NAME } from '@/constants';
import { Route } from '@/types/Route';
import { escapedJsonStringify } from '@/utils/json/escapedJsonStringify';
import { compileRoutes } from '@/utils/routes';

const routesDefinitionModuleId = 'virtual:@vext/routes-definition';
const resolvedRoutesDefinitionModuleId = `\0${routesDefinitionModuleId}`;

export const vextRoutePlugin = (vextConfig: ResolvedVextConfig): Plugin => {
  const baseDirectory = `${path.resolve(vextConfig.root)}/${PAGES_DIRECTORY_NAME}`;
  const globPatternBase = `${baseDirectory}/**/*`;
  const globPatterns = vextConfig.pageExtensions.map(pageExtension => `${globPatternBase}${pageExtension}`);

  return {
    name: 'vext-route-plugin',
    resolveId(id) {
      if (id === routesDefinitionModuleId) {
        return resolvedRoutesDefinitionModuleId;
      }

      return null;
    },

    async load(id) {
      if (id !== resolvedRoutesDefinitionModuleId) {
        return null;
      }

      const pages = await fastGlob(globPatterns);
      const rootRoute = compileRoutes(
        vextConfig,
        pages.map(filePath => path.normalize(filePath).replace(baseDirectory, '')),
      );

      const declareComponent = (componentPath: string) => `lazy(() => import(${escapedJsonStringify(componentPath)}));`;
      const declareRoute = (route: Route): string =>
        '{' +
        `path: ${escapedJsonStringify(route.pathname)},` +
        'loader: routeLoader,' +
        `component: ${declareComponent(route.file)},` +
        `handle: ${escapedJsonStringify({ asPath: route.asPath })},` +
        `${route.children ? `children: [${route.children.map(declareRoute).join(',\n')}]` : ''}` +
        '}';

      return `import { routeLoader } from '@vext/router';\nexport default ${declareRoute(rootRoute)};`;
    },

    configureServer(server) {
      server.watcher.add(globPatterns);
      server.watcher.on('all', (_eventName, watchedPath) => {
        if (!micromatch.isMatch(watchedPath, globPatterns)) {
          return;
        }

        const routesDefinitionModule = server.moduleGraph.getModuleById(routesDefinitionModuleId);
        if (!routesDefinitionModule) {
          return;
        }

        server.reloadModule(routesDefinitionModule);
      });
    },
  };
};

export const vextPlugin = (vextConfig: ResolvedVextConfig) => [vextRoutePlugin(vextConfig)];
