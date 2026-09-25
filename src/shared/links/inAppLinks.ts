// src/shared/links/inAppLinks.ts

// QueerPulse's own hosts. `window.location.host` additionally covers wherever
// the app is actually being served (a preview deploy, a LAN address, a dev
// server), same reasoning as `linkify.tsx`'s `isExternalHref`, which keeps its
// own copy of this list.
const QUEERPULSE_HOSTS = new Set(["queerpulse.com", "www.queerpulse.com"]);

/** True when `host` (a `URL.host`, port and all) is QueerPulse itself: the
 *  host the app is served from, or one of its production hosts. Compared
 *  case-insensitively, and safe to call during prerender (no `window`). */
export function isQueerPulseHost(host: string): boolean {
  const lowerHost = host.toLowerCase();
  const servedHost =
    typeof window === "undefined" ? "" : window.location.host.toLowerCase();
  if (servedHost !== "" && lowerHost === servedHost) return true;
  return QUEERPULSE_HOSTS.has(lowerHost);
}

// A last path segment with a file extension (`/robots.txt`, `/sitemap.xml`,
// `/og/card.png`) is a static file the host serves directly, and the SPA's
// router has no route for it.
const FILE_EXTENSION_RE = /\.[a-z0-9]+$/i;

/**
 * The in-app route (`pathname + search + hash`) for a link that points back
 * into QueerPulse, or null when the link leaves the product, fails to parse,
 * or names a static file. Links across the app (chat, forum posts, articles)
 * often open in a new tab, and an installed PWA hands a new tab to the system
 * browser, so a link into the app needs routing through the SPA instead.
 */
export function inAppPathForHref(href: string): string | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username !== "" || url.password !== "") return null;
  if (!isQueerPulseHost(url.host)) return null;
  if (FILE_EXTENSION_RE.test(url.pathname)) return null;
  return `${url.pathname}${url.search}${url.hash}`;
}

/** A plain left-click with no modifier held. A modified click (open in a new
 *  tab or window) or a non-primary button is left to the browser's native
 *  anchor handling. Accepts a native or a React mouse event. */
export function isPlainLeftClick(
  event: Pick<
    MouseEvent,
    "button" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey"
  >,
): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}
