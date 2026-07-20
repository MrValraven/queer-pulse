/**
 * Build-time prerender detection.
 *
 * `scripts/prerender.mjs` visits every public page in headless Chromium and
 * serialises the settled DOM to `dist/<path>/index.html`, so that crawlers which
 * do not execute JavaScript — notably the AI retrieval bots — receive real
 * content instead of an empty `<div id="root">`.
 *
 * That serialisation happens at a single moment in time. Anything the app does
 * to *delay* content (a simulated fetch, a skeleton, a count-up animation) is a
 * race against it, and losing that race means shipping a skeleton to the exact
 * audience this whole mechanism exists to serve. Rather than tuning timeouts,
 * the prerenderer appends `?__prerender=1` and the app skips those delays
 * outright.
 *
 * This is deliberately a query parameter rather than a build-time env flag: the
 * same production bundle is used for real users and for the prerender pass, so
 * the signal has to be per-navigation. It never appears in canonical or og:url,
 * which are built from `useLocation().pathname` (search is excluded).
 */
const PRERENDER_QUERY_PARAMETER = "__prerender";

/** True only while `scripts/prerender.mjs` is rendering this page. */
export function isPrerendering(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has(
    PRERENDER_QUERY_PARAMETER,
  );
}
