import { dirname, resolve } from 'path/posix';

import { ResolvedVextConfig } from '@/config';
import { INDEX_FILE_NAME, LAYOUT_FILE_NAME, PAGES_DIRECTORY_NAME } from '@/constants';
import { PathSegment, Route } from '@/types/Route';

const findLargestPrefix = (haystack: string, needles: string[]): string | null =>
  needles.reduce<string | null>((prev, curr) => {
    if (!haystack.startsWith(curr)) {
      return prev;
    }

    if (typeof prev === 'string' && prev.length > curr.length) {
      return prev;
    }

    return curr;
  }, null);

const findLargestSuffix = (haystack: string, needles: string[]): string | null =>
  needles.reduce<string | null>((prev, curr) => {
    if (!haystack.endsWith(curr)) {
      return prev;
    }

    if (typeof prev === 'string' && prev.length > curr.length) {
      return prev;
    }

    return curr;
  }, null);

export const parsePath = (filePath: string): PathSegment[] =>
  filePath.split('/').reduce<PathSegment[]>((parsed, segment, index, { length }) => {
    const isEmptySegment = !segment;
    const isRouteGroup = segment.startsWith('(');
    const isIndexFile = index === length - 1 && segment === INDEX_FILE_NAME;
    if (isEmptySegment || isRouteGroup || isIndexFile) {
      return parsed;
    }

    if (segment === '[[...]]') {
      parsed.push({ kind: 'splat' });
      return parsed;
    }

    const dynamicSegment = segment.match(/^\[(.+)\]$/);
    if (dynamicSegment) {
      parsed.push({ kind: 'dynamic', name: dynamicSegment[1] });
      return parsed;
    }

    parsed.push({ kind: 'static', name: segment });
    return parsed;
  }, []);

export const stringifyPath = (segments: PathSegment[]) =>
  segments
    .map(segment => {
      if (segment.kind === 'splat') {
        return '*';
      }

      if (segment.kind === 'dynamic') {
        return `:${segment.name}`;
      }

      return segment.name;
    })
    .join('/');

export const compileRoutes = (config: ResolvedVextConfig, filePathes: string[]): Route => {
  const compiledPathes = filePathes.map<Omit<Route, 'children'>>(filePath => {
    const usedPageExtension = findLargestSuffix(filePath, config.pageExtensions);
    const asPath = filePath.slice(0, -(usedPageExtension?.length ?? -Infinity));
    const segments = parsePath(asPath);
    return { asPath, file: filePath, segments, pathname: stringifyPath(segments) };
  });

  const layouts = compiledPathes
    .filter(({ segments }) => {
      const lastPath = segments[segments.length - 1];
      return lastPath?.kind === 'static' && lastPath.name === LAYOUT_FILE_NAME;
    })
    .map(compiledPath => ({
      ...compiledPath,
      segments: compiledPath.segments.slice(0, -1),
      children: [],
    }));

  const layoutByLayoutDirectory = new Map(layouts.map(layout => [`${dirname(layout.file)}/`, layout]));
  const rootLayout = layoutByLayoutDirectory.get('/');
  if (!rootLayout) {
    const errorMessage =
      'No root layout file exists in the pages directory!\n\n' +
      `Allowed names:\n${config.pageExtensions
        .map(extension => resolve(config.root, PAGES_DIRECTORY_NAME, `${LAYOUT_FILE_NAME}${extension}`))
        .join('\n')}`;

    throw new Error(errorMessage);
  }

  const layoutDirectories = Array.from(layoutByLayoutDirectory.keys());
  compiledPathes.forEach(compiledPath => {
    const parentLayoutDirectory = findLargestPrefix(
      compiledPath.file,
      layoutDirectories.filter(layoutDirectory => layoutDirectory !== compiledPath.file),
    ) as string;

    const parentLayout = layoutByLayoutDirectory.get(parentLayoutDirectory) as Route;
    parentLayout.children?.push(compiledPath);
  });

  return rootLayout;
};
