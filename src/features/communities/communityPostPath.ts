import { communityPath } from "../../app/routeMap";

/**
 * A single community post's permalink (`/community/:slug/post/:postId`).
 *
 * Built on `routeMap`'s own `communityPath`, so the community half of the URL
 * still has exactly one definition. It lives here rather than in `routeMap.ts`
 * because the route it addresses is registered by this feature's own
 * `communitiesRoutes()`; a `communityPostPath` export in `routeMap.ts` would
 * be the tidier home for it and is proposed to the maintainer separately.
 *
 * Used by the Pulse copy-link affordance, the reply/mention notification
 * adapters, and anything else that needs to point at a post rather than at the
 * top of the timeline the post happens to sit in.
 */
export const communityPostPath = (slug: string, postId: string) =>
  `${communityPath(slug)}/post/${postId}`;

/** The same permalink as an absolute URL, for the clipboard and the share
 *  sheet. `window.location.origin` keeps it correct on every deployment
 *  (localhost, preview, production) without a build-time base URL. */
export const communityPostUrl = (slug: string, postId: string) =>
  `${window.location.origin}${communityPostPath(slug, postId)}`;
