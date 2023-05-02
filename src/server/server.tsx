import { IncomingMessage, ServerResponse } from 'node:http';

import { ReactDOMServerReadableStream, renderToReadableStream } from 'react-dom/server';
import { RouteObject } from 'react-router-dom';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom/server';

import { RenderContext } from '@/types/RenderContext';
import { createFetchRequest, pipeToNodeResponse } from '@/utils/node';

export const createTransformPipeline = serverContext => {
  // TODO
};

export const createRender =
  (routes: RouteObject[]) =>
  async (request: Request, renderContext: RenderContext): Promise<Response | ReactDOMServerReadableStream> => {
    const handler = createStaticHandler(routes);
    const context = await handler.query(request, { requestContext: renderContext });

    if (context instanceof Response) {
      return context;
    }

    const router = createStaticRouter(handler.dataRoutes, context);
    return renderToReadableStream(<StaticRouterProvider context={context} router={router} />);
  };

type CreateRenderContext = (request: IncomingMessage, response: ServerResponse) => RenderContext;
export const createNodeRender = (routes: RouteObject[], createRenderContext: CreateRenderContext) => {
  const render = createRender(routes);

  return async (request: IncomingMessage, response: ServerResponse) => {
    const fetchRequest = createFetchRequest(request);
    const renderContext = createRenderContext(request, response);
    const result = await render(fetchRequest, renderContext);
    if (result instanceof Response) {
      pipeToNodeResponse(result, response);
      return;
    }

    result.pipeTo;
  };
};
