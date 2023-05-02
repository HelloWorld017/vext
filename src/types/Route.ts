type DynamicPathSegment = { kind: 'dynamic'; name: string };
type StaticPathSegment = { kind: 'static'; name: string };
type SplatPathSegment = { kind: 'splat' };
export type PathSegment = DynamicPathSegment | StaticPathSegment | SplatPathSegment;

export type Route = {
  asPath: string;
  file: string;
  segments: PathSegment[];
  pathname: string;
  children?: Route[];
};

export type RouteHandle = {
  asPath: string;
};
