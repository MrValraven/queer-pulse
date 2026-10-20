import { routes } from "../../app/routeMap";
import {
  findStudioLink,
  isStudioLinkBoundary,
  resolvedOwnOriginUrl,
  type StudioShareKind,
} from "../studio/share/studioLinkTarget";
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

const STUDIO_PATH = /^\/studio(?:\/|$)/i;

function decodedOrSelf(pathname: string): string {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

/**
 * Whether `href` points anywhere under `/studio` on this deployment, card or
 * no card. The chat link-card resolver skips the OpenGraph unfurl for every
 * such link: an artist page would only unfurl the SPA shell, and a
 * `/studio/preview/<token>` link is a bearer secret that must never reach
 * `GET /link-preview`. Case-blind, percent-decoded one pass and with repeated
 * slashes collapsed. Plan 1's `isOwnOriginStudioUrl` decodes up to three
 * passes; this check stops at one on purpose, and the server's check is the
 * backstop for a link encoded more than once. Userinfo on an own origin still
 * counts as own, so such a link skips the unfurl too.
 */
export function isOwnStudioUrl(href: string): boolean {
  const url = resolvedOwnOriginUrl(href);
  if (!url) return false;
  return [url.pathname, decodedOrSelf(url.pathname)].some((pathname) =>
    STUDIO_PATH.test(pathname.replace(/\/{2,}/g, "/")),
  );
}

const STUDIO_KIND_BY_SEGMENT: Readonly<Record<string, StudioShareKind>> = {
  track: "track",
  album: "release",
  collection: "playlist",
};

// Where a link candidate may start (the grammar's `http://`, `https://` or
// `/studio/`), and the head a cut Studio link keeps, whatever is left of its
// id after the cut.
const LINK_CANDIDATE_START = /https?:\/\/|\/studio\//gi;
const CUT_STUDIO_LINK_HEAD =
  /^(?:https?:\/\/[^\s/]+)?\/studio\/(track|album|collection)\?id=/i;
const WHITESPACE_CHARACTER = /\s/;

/** Where the first link candidate in `run` starts, or -1. The run has no
 *  whitespace, so that candidate consumes the rest of it, as the grammar's
 *  scan does: a later start inside it is never a candidate of its own. */
function firstCandidateStart(run: string): number {
  for (const candidate of run.matchAll(LINK_CANDIDATE_START)) {
    const startIndex = candidate.index;
    if (startIndex === 0 || isStudioLinkBoundary(run.charAt(startIndex - 1))) {
      return startIndex;
    }
  }
  return -1;
}

/** The last run of non-whitespace in `text`, found with a linear scan. */
function lastRunOf(text: string): string {
  let runStart = text.length;
  while (
    runStart > 0 &&
    !WHITESPACE_CHARACTER.test(text.charAt(runStart - 1))
  ) {
    runStart -= 1;
  }
  return text.slice(runStart);
}

/**
 * The kind of Studio link a reply quote's snippet carries, or null. The
 * server cuts a snippet at 120 characters, so a note plus a Studio URL often
 * arrives with half the id; a link cut at the tail still names its kind. The
 * cut link follows the grammar's candidate boundary, origins and userinfo
 * rule.
 */
export function studioKindInQuoteSnippet(
  snippet: string,
): StudioShareKind | null {
  const match = findStudioLink(snippet);
  if (match) return match.target.kind;
  const lastRun = lastRunOf(snippet.trim());
  const startIndex = firstCandidateStart(lastRun);
  if (startIndex === -1) return null;
  const cutLink = lastRun.slice(startIndex);
  const head = CUT_STUDIO_LINK_HEAD.exec(cutLink);
  if (!head) return null;
  const cutUrl = resolvedOwnOriginUrl(cutLink);
  if (!cutUrl || cutUrl.username !== "" || cutUrl.password !== "") return null;
  return STUDIO_KIND_BY_SEGMENT[(head[1] ?? "").toLowerCase()] ?? null;
}
