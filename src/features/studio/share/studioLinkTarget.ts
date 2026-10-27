import { routes } from "../../../app/routeMap";
import { isDemoModeRuntime } from "../../../shared/api/demoModeRuntime";

/**
 * The Studio link grammar (contract, "Link grammar"): an absolute URL on one
 * of this deployment's origins, or a root-relative path, whose path is
 * exactly a track, release or playlist page with an `id`. Every surface that
 * turns a link into a card (chat bubbles, the share picker, inbox rows, reply
 * quotes, posts) asks this module, so the rule lives in one place. An artist
 * page is a Studio link only with a `milestone`. Preview links, scenes and
 * shelves are never Studio links here.
 *
 * A lyric link (PRD-13) is a track link with `line`, the index of one timed
 * lyric line: `/studio/track?id=<id>&t=<s>&line=<n>`. The URL carries the
 * index only, never the words; each reader's card reads the line from its
 * own track read. The backend reader (`studio-share-link.ts`) reads the same
 * link as a track with `lineIndex` and builds the same canonical path.
 *
 * A milestone link is an artist link with `milestone`, the id of one reached
 * milestone: `/studio/artist?id=<artistId>&milestone=<id>`. Both ids must
 * read as ids; an artist link without a usable `milestone` stays a plain link
 * with no card. The card reads the milestone by its id, and the backend
 * reader builds the same canonical path, `id` first.
 */
export type StudioShareKind =
  "track" | "release" | "playlist" | "lyric" | "milestone";

export interface StudioLinkTarget {
  kind: StudioShareKind;
  /** The track's id for a track or lyric link. */
  id: string;
  /** Track and lyric links only: whole seconds from `t`, 0 to 86400. */
  startAtSeconds: number | null;
  /** Lyric links only: the timed line's index, 0 to 499. */
  lineIndex?: number;
  /** Milestone links only: the persona's id, lowercased (the backend's `artistId`). */
  artistId?: string;
}

export interface StudioLinkMatch {
  target: StudioLinkTarget;
  /** The exact substring found in the text. */
  url: string;
}

const KIND_BY_PATH: Readonly<Record<string, StudioShareKind>> = {
  [routes.studioTrack]: "track",
  [routes.studioAlbum]: "release",
  [routes.studioCollection]: "playlist",
};

const PATH_BY_KIND: Readonly<Record<StudioShareKind, string>> = {
  track: routes.studioTrack,
  release: routes.studioAlbum,
  playlist: routes.studioCollection,
  lyric: routes.studioTrack,
  milestone: routes.studioArtist,
};

/** Lyric links: the `line` index, up to the 500 timed lines a track holds
 *  (`LIMITS.syncedLyricsMax`). Anything else leaves a plain track link, as
 *  an unusable `t` leaves the link without a start. */
const LINE_INDEX_PATTERN = /^\d{1,3}$/;
export const STUDIO_LYRIC_MAX_LINE_INDEX = 499;

// The production origins; the origin serving the app (a preview deploy, the
// dev server) counts too. Exact origins, so another port or scheme is out.
const CANONICAL_ORIGINS: ReadonlySet<string> = new Set([
  "https://queerpulse.com",
  "https://www.queerpulse.com",
]);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
// Demo Studio ids are slugs; only demo mode reads them (contract point 1).
const DEMO_ID_PATTERN = /^demo-[a-z0-9-]+$/;
const START_SECONDS_PATTERN = /^\d{1,5}$/;
const MAX_START_SECONDS = 86_400;
// Resolves a root-relative path; never a host anyone can reach.
const RELATIVE_PATH_BASE = "https://studio-share.invalid";
const RELATIVE_PATH_ORIGIN = new URL(RELATIVE_PATH_BASE).origin;
const URL_START_PATTERN = /https?:\/\/|\/studio\//gi;
// Sticky: reads the non-whitespace run from `lastIndex` without slicing.
const RUN_PATTERN = /\S+/y;
// A candidate starts at the text's start or after one of these (contract,
// "Link grammar"), so `example.com/studio/...` never reads as a relative path.
const CANDIDATE_BOUNDARY = /[\s([{<«'"]/;
// Trimmed off a candidate's end; `>` closes a `<` boundary, `»` closes `«`.
// Read one character at a time from the end, so the trim stays linear.
const TRAILING_CHARACTERS: ReadonlySet<string> = new Set([...".,;:!?)]}>»'\""]);
const SPACE_CHARACTERS: ReadonlySet<string> = new Set([" ", "\t"]);
// The closer that pairs with each opener a link can sit inside.
const CLOSER_BY_OPENER: ReadonlyMap<string, string> = new Map([
  ["(", ")"],
  ["[", "]"],
  ["{", "}"],
  ["<", ">"],
  ["«", "»"],
  ["'", "'"],
  ['"', '"'],
]);
/** A note with nothing left to read: brackets, punctuation and spaces only. */
const LEFTOVER_ONLY = /^[\s.,;:!?()[\]{}<>«»'"]*$/;

/** True for this deployment's origins: the one serving the app and the
 *  production ones. `origin` is a `URL.origin`, already lower-cased. An
 *  opaque served origin ("null", a sandboxed frame) matches nothing. */
export function isStudioLinkOrigin(origin: string): boolean {
  const servedOrigin =
    typeof window === "undefined" ? "" : window.location.origin.toLowerCase();
  const isServedOriginUsable = servedOrigin !== "" && servedOrigin !== "null";
  return (
    (isServedOriginUsable && origin === servedOrigin) ||
    CANONICAL_ORIGINS.has(origin)
  );
}

/** True when `character` may sit right before a link candidate. */
export function isStudioLinkBoundary(character: string): boolean {
  return character.length > 0 && CANDIDATE_BOUNDARY.test(character);
}

function withoutTrailing(text: string, characters: ReadonlySet<string>) {
  let endIndex = text.length;
  while (endIndex > 0 && characters.has(text.charAt(endIndex - 1))) {
    endIndex -= 1;
  }
  return text.slice(0, endIndex);
}

function withoutLeading(text: string, characters: ReadonlySet<string>) {
  let startIndex = 0;
  while (startIndex < text.length && characters.has(text.charAt(startIndex))) {
    startIndex += 1;
  }
  return text.slice(startIndex);
}

function normalizedId(rawId: string | null): string | null {
  if (rawId === null) return null;
  // No trim: a padded id is one the Studio pages would not read either.
  const id = rawId.toLowerCase();
  if (UUID_PATTERN.test(id)) return id;
  return isDemoModeRuntime() && DEMO_ID_PATTERN.test(id) ? id : null;
}

function startSecondsOf(rawStart: string | null): number | null {
  if (rawStart === null || !START_SECONDS_PATTERN.test(rawStart)) return null;
  const seconds = Number(rawStart);
  return seconds <= MAX_START_SECONDS ? seconds : null;
}

function lineIndexOf(rawLine: string | null): number | null {
  if (rawLine === null || !LINE_INDEX_PATTERN.test(rawLine)) return null;
  const lineIndex = Number(rawLine);
  return lineIndex <= STUDIO_LYRIC_MAX_LINE_INDEX ? lineIndex : null;
}

/** True for a track or a lyric link: both open the track page and play. */
export function isTrackShareKind(kind: StudioShareKind): boolean {
  return kind === "track" || kind === "lyric";
}

/** One key per card target: a lyric link on another line is another card. */
export function studioShareTargetKey(target: StudioLinkTarget): string {
  return target.lineIndex === undefined
    ? `${target.kind}:${target.id}`
    : `${target.kind}:${target.id}:${target.lineIndex}`;
}

/** The milestone link for one reached milestone of one persona. */
export function studioMilestoneTarget(
  artistId: string,
  milestoneId: string,
): StudioLinkTarget {
  return {
    kind: "milestone",
    id: milestoneId,
    artistId,
    startAtSeconds: null,
  };
}

/** The lyric link for one timed line, starting where the line starts. */
export function studioLyricTarget(
  trackId: string,
  lineIndex: number,
  lineStartMs: number,
): StudioLinkTarget {
  return {
    kind: "lyric",
    id: trackId,
    startAtSeconds: Math.min(
      Math.max(Math.floor(lineStartMs / 1000), 0),
      MAX_START_SECONDS,
    ),
    lineIndex,
  };
}

function isRootRelative(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//");
}

/**
 * `href` resolved as a URL on this deployment, or null. An absolute URL must
 * sit on a Studio link origin; a root-relative path must stay on the
 * placeholder base (`/\host/...` resolves to another host and is refused).
 * Userinfo is left for the caller to judge: the card parser refuses it, the
 * unfurl guard still treats such a link as its own.
 */
export function resolvedOwnOriginUrl(href: string): URL | null {
  const trimmedHref = href.trim();
  let parsed: URL;
  try {
    parsed = new URL(trimmedHref, RELATIVE_PATH_BASE);
  } catch {
    return null;
  }
  if (isRootRelative(trimmedHref)) {
    return parsed.origin === RELATIVE_PATH_ORIGIN ? parsed : null;
  }
  return isStudioLinkOrigin(parsed.origin) ? parsed : null;
}

export function parseStudioLink(url: string): StudioLinkTarget | null {
  const parsed = resolvedOwnOriginUrl(url);
  if (!parsed) return null;
  if (parsed.username !== "" || parsed.password !== "") return null;
  if (parsed.pathname === routes.studioArtist) {
    return milestoneTargetOf(parsed.searchParams);
  }
  const kind = KIND_BY_PATH[parsed.pathname];
  if (!kind) return null;
  const id = normalizedId(parsed.searchParams.get("id"));
  if (id === null) return null;
  if (kind !== "track") return { kind, id, startAtSeconds: null };
  const startAtSeconds = startSecondsOf(parsed.searchParams.get("t"));
  const lineIndex = lineIndexOf(parsed.searchParams.get("line"));
  return lineIndex === null
    ? { kind, id, startAtSeconds }
    : { kind: "lyric", id, startAtSeconds, lineIndex };
}

/** An artist link is a card only with a usable `milestone`. */
function milestoneTargetOf(
  searchParams: URLSearchParams,
): StudioLinkTarget | null {
  const artistId = normalizedId(searchParams.get("id"));
  const milestoneId = normalizedId(searchParams.get("milestone"));
  if (artistId === null || milestoneId === null) return null;
  return {
    kind: "milestone",
    id: milestoneId,
    artistId,
    startAtSeconds: null,
  };
}

interface StudioLinkMatchAt {
  match: StudioLinkMatch;
  /** Where `match.url` starts in the scanned text. */
  index: number;
}

function findStudioLinkWithIndex(text: string): StudioLinkMatchAt | null {
  // A scanned run is consumed whole (as the backend's matchAll consumes it):
  // a start inside it is never a new candidate, which keeps the scan linear.
  let scannedUntil = 0;
  for (const candidate of text.matchAll(URL_START_PATTERN)) {
    const startIndex = candidate.index;
    if (startIndex < scannedUntil) continue;
    if (startIndex > 0 && !isStudioLinkBoundary(text.charAt(startIndex - 1))) {
      continue;
    }
    RUN_PATTERN.lastIndex = startIndex;
    const run = RUN_PATTERN.exec(text)?.[0] ?? "";
    scannedUntil = startIndex + run.length;
    const url = withoutTrailing(run, TRAILING_CHARACTERS);
    const target = parseStudioLink(url);
    if (target) return { match: { target, url }, index: startIndex };
  }
  return null;
}

/** The first Studio link in free text. A candidate is the maximal run of
 *  non-whitespace from `http://`, `https://` or `/studio/`, at the start of
 *  the text or after whitespace or an opening bracket or quote, with
 *  trailing punctuation and closing brackets trimmed. */
export function findStudioLink(text: string): StudioLinkMatch | null {
  return findStudioLinkWithIndex(text)?.match ?? null;
}

/** `findStudioLink` with where the link starts in `text`, read by the same
 *  scan, so a caller's index always points at the run the scan matched. */
export function findStudioLinkAt(
  text: string,
): { match: StudioLinkMatch; index: number } | null {
  return findStudioLinkWithIndex(text);
}

const NEWLINE_CHARACTERS: ReadonlySet<string> = new Set(["\n"]);

/** Joins the text on either side of a removed link (contract, "Note text"). */
function joinedAroundLink(rawBefore: string, rawAfter: string): string {
  let before = withoutTrailing(rawBefore, SPACE_CHARACTERS);
  let after = withoutLeading(rawAfter, SPACE_CHARACTERS);
  const closer = CLOSER_BY_OPENER.get(before.charAt(before.length - 1));
  if (closer !== undefined && after.startsWith(closer)) {
    before = withoutTrailing(before.slice(0, -1), SPACE_CHARACTERS);
    after = withoutLeading(after.slice(closer.length), SPACE_CHARACTERS);
  }
  const beforeText = withoutTrailing(before, NEWLINE_CHARACTERS);
  const afterText = withoutLeading(after, NEWLINE_CHARACTERS);
  const beforeBreakCount = before.length - beforeText.length;
  const afterBreakCount = after.length - afterText.length;
  if (beforeBreakCount > 0 && afterBreakCount > 0) {
    // A link with a line or a paragraph to itself leaves one such break.
    const breakCount = Math.max(beforeBreakCount, afterBreakCount);
    return `${beforeText}${"\n".repeat(breakCount)}${afterText}`;
  }
  const shouldJoinWithSpace =
    before !== "" &&
    after !== "" &&
    beforeBreakCount === 0 &&
    afterBreakCount === 0 &&
    !TRAILING_CHARACTERS.has(after.charAt(0));
  return `${before}${shouldJoinWithSpace ? " " : ""}${after}`;
}

/** The text with the matched link taken out (contract, "Note text"): CRLF
 *  read as LF; an opener right before the link and its closer right after it
 *  dropped with it; the two sides joined by one space (none before closing
 *  punctuation or across a line break); a link on its own line or paragraph
 *  leaves one line or paragraph break; then trimmed. "" when only brackets,
 *  punctuation and spaces are left. */
export function textWithoutStudioLink(
  text: string,
  match: StudioLinkMatch,
): string {
  const normalizedText = text.replace(/\r\n/g, "\n");
  const found = findStudioLinkWithIndex(normalizedText);
  const linkIndex =
    found && found.match.url === match.url
      ? found.index
      : normalizedText.indexOf(match.url);
  if (linkIndex === -1) return normalizedText.trim();
  const note = joinedAroundLink(
    normalizedText.slice(0, linkIndex),
    normalizedText.slice(linkIndex + match.url.length),
  ).trim();
  return LEFTOVER_ONLY.test(note) ? "" : note;
}

/** The canonical root-relative form, built in the backend's order: `id`,
 *  then `t` when set, then `line` on a lyric link; a milestone link names the
 *  persona's `id`, then `milestone`. */
export function studioLinkPath(target: StudioLinkTarget): string {
  if (target.kind === "milestone") {
    return `${routes.studioArtist}?id=${encodeURIComponent(target.artistId ?? "")}&milestone=${encodeURIComponent(target.id)}`;
  }
  const path = `${PATH_BY_KIND[target.kind]}?id=${encodeURIComponent(target.id)}`;
  if (!isTrackShareKind(target.kind)) return path;
  const timedPath =
    target.startAtSeconds !== null
      ? `${path}&t=${target.startAtSeconds}`
      : path;
  return target.kind === "lyric" && target.lineIndex !== undefined
    ? `${timedPath}&line=${target.lineIndex}`
    : timedPath;
}

export function studioLinkUrl(target: StudioLinkTarget): string {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}${studioLinkPath(target)}`;
}
