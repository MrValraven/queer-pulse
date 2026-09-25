import { routes } from "../../app/routeMap";
import { isExternalHref } from "./linkify";

// One trailing slash so a bare "/local/directory" (the grid itself, no slug)
// never matches: `startsWith` needs the extra character a real place path has.
const DIRECTORY_PREFIX = `${routes.directory}/`;

/** The first path segment of every `/local/directory/*` route that is NOT a
 *  single place, computed from the same `routes` constants rather than
 *  hardcoded strings so a renamed route can never silently desync this list. */
const RESERVED_FIRST_SEGMENTS = new Set(
  [routes.listBusiness, routes.listBusinessEdit, routes.listingClaims]
    .map((path) => path.slice(DIRECTORY_PREFIX.length).split("/")[0])
    .filter(Boolean),
);

/**
 * The directory place slug `href` points at, or `null` when it is not a link
 * to exactly one place page on this deployment.
 *
 * Used to tell a shared "Send in a message" link (`businessPath(slug)`) apart
 * from an ordinary external URL, so the chat surfaces (`MessageLinkCard`) can
 * show the real place card instead of unfurling the SPA shell's generic
 * OpenGraph tags.
 *
 * Three things all have to hold:
 *  - `href` resolves to THIS deployment (`isExternalHref` false), meaning a
 *    link to `queerpulse.com` from a preview build, or to the current dev
 *    host, counts; a link to a different site never does.
 *  - the pathname is `${routes.directory}/<one segment>`, optional trailing
 *    slash, always excluding the bare directory index and any route nested
 *    deeper (a listing's own sub-pages, if any are ever added).
 *  - that one segment names an actual place slug, excluding every one of the
 *    directory's own non-place routes (`routes.listBusiness`,
 *    `listBusinessEdit`, `routes.listingClaims`) that happens to sit one
 *    segment deep too.
 *
 * Query string and hash are ignored entirely: a share link, a tracked click,
 * or a deep link with `#reviews` all name the same place.
 */
export function internalPlaceSlug(href: string): string | null {
  if (isExternalHref(href)) return null;

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }

  const pathname = url.pathname.replace(/\/+$/, "");
  if (!pathname.startsWith(DIRECTORY_PREFIX)) return null;

  const remainder = pathname.slice(DIRECTORY_PREFIX.length);
  if (remainder === "" || remainder.includes("/")) return null;
  if (RESERVED_FIRST_SEGMENTS.has(remainder)) return null;

  try {
    const slug = decodeURIComponent(remainder);
    return slug === "" ? null : slug;
  } catch {
    return null;
  }
}
