import connect from 'connect';
import { createStaticHandler, createStaticRouter } from 'react-router-dom/server';
import { createServer } from 'vite';

import { getViteConfig } from '@/build/viteConfig';
import { ResolvedVextConfig } from '@/config';
import { createFetchRequest } from '@/utils/node';

export const getMiddleware = async (resolvedConfig: ResolvedVextConfig) => {
  const app = connect();
  const vite = await createServer(getViteConfig(resolvedConfig));

  app.use(vite.middlewares);
  app.use(async (req, res, next) => {
    const routes = await vite.ssrLoadModule('virtual:@vext/routes-definition');
  });
  return app;
};
