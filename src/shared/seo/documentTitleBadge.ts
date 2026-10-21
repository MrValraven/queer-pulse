/**
 * The unread count shown in front of the browser tab title, WhatsApp style:
 * "(3) QueerPulse". The page's own title and the count are stored separately
 * and every title write goes through `writeDocumentTitle`, so the count
 * survives navigation without ever being parsed back out of the title text. A
 * title can legitimately start with a bracketed number ("(500) Days of
 * Summer" in Cinema), so stripping a prefix by pattern would mangle it.
 *
 * Anything that READS the title for a human purpose (screen reader page names,
 * saved-item names, share titles) reads `getDocumentBaseTitle()` instead of
 * `document.title`, so the count never leaks into it.
 *
 * A short status prefix ("Playing:" while Studio audio plays) is stored the
 * same way: composed into the written title after the count, and never part
 * of the base title.
 */

/** Counts above this render as "99+", the same cap a nav badge uses. */
const MAX_SHOWN_COUNT = 99;

let baseTitle: string | null = null;
let badgeCount = 0;
/** A status word shown before the page's own title; null for none. */
let titlePrefix: string | null = null;
/** The last string this module wrote, to tell whether someone else wrote since. */
let lastWrittenTitle: string | null = null;

function formatTitle(title: string, count: number): string {
  const prefixedTitle = titlePrefix ? `${titlePrefix} ${title}` : title;
  if (count <= 0) return prefixedTitle;
  const shownCount =
    count > MAX_SHOWN_COUNT ? `${MAX_SHOWN_COUNT}+` : String(count);
  return `(${shownCount}) ${prefixedTitle}`;
}

/**
 * The page's own title, without the unread count. When something outside this
 * module wrote `document.title` directly (the static shell, a prerendered page
 * on first load), that write is taken as the base as-is.
 */
export function getDocumentBaseTitle(): string {
  if (baseTitle !== null && document.title === lastWrittenTitle) {
    return baseTitle;
  }
  return document.title;
}

/** Set the page's own title; the current unread count is prefixed to it. */
export function writeDocumentTitle(title: string): void {
  baseTitle = title;
  document.title = formatTitle(title, badgeCount);
  // Read back rather than keep the string written: the browser strips and
  // collapses whitespace in `document.title`, so a title with a doubled or
  // edge space ("Ana  — QueerPulse", or " — QueerPulse" while a name loads)
  // never compared equal to it. `getDocumentBaseTitle` then took the badged
  // text as the page's own title, and the count stuck until a reload.
  lastWrittenTitle = document.title;
}

/** Set the unread count shown in front of the title (0 clears it). */
export function setDocumentTitleBadge(count: number): void {
  const title = getDocumentBaseTitle();
  badgeCount = count;
  writeDocumentTitle(title);
}

/** Set a status prefix shown between the unread count and the page's own
 *  title ("(3) Playing: Tide · Studio"); null or "" clears it. The base title
 *  `getDocumentBaseTitle()` returns never includes it. */
export function setDocumentTitlePrefix(text: string | null): void {
  const title = getDocumentBaseTitle();
  const trimmed = text?.trim() ?? "";
  titlePrefix = trimmed === "" ? null : trimmed;
  writeDocumentTitle(title);
}
