/**
 * The managed "sources you've turned down" list (SOC-18).
 *
 * A feature-local constant rather than a `routeMap.ts` entry, following the
 * precedent `communityPostPath.ts` set: the route is registered by this
 * feature's own `routes.tsx`, so its path lives beside it and no shared file
 * has to change to add a page inside one feature.
 */
export const FEED_MUTED_PATH = "/feed/muted";
