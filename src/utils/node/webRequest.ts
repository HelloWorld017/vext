import { IncomingMessage, ServerResponse } from 'node:http';
import { Readable } from 'node:stream';
import type { ReadableStream as ReadableStreamNode } from 'node:stream/web';

import { RequestError } from '@/types/Error';

export const createFetchRequest = (req: IncomingMessage): Request => {
  if (!req.headers.host || !req.url) {
    const error = new Error() as RequestError;
    error.statusCode = 400;
    throw error;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  const controller = new AbortController();
  req.on('close', () => controller.abort());

  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    const headerEntries = Array.isArray(value) ? value : [value];
    headerEntries.filter(<T>(x: T | undefined): x is T => !!x).forEach(item => headers.append(key, item));
  });

  const init: RequestInit = {
    method: req.method,
    headers,
    signal: controller.signal,
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = Readable.toWeb(req) as ReadableStream;
  }

  return new Request(url.href, init);
};

export const pipeToNodeResponse = (res: Response, nodeResponse: ServerResponse) => {
  /* eslint-disable no-param-reassign */
  nodeResponse.statusCode = res.status;
  nodeResponse.statusMessage = res.statusText;
  res.headers.forEach((value, key) => nodeResponse.setHeader(key, value));

  if (res.body) {
    Readable.fromWeb(res.body as ReadableStreamNode).pipe(nodeResponse);
  }
  /* eslint-enable no-param-reassign */
};
