/**
 * The blurb a member's directory card shows: their short bio (the backend's
 * `tagline`), falling back to the opening of their longer bio when they haven't
 * written one.
 *
 * This rule is a CONTRACT SHARED WITH THE BACKEND. `GET /members` must serve each
 * card's `tagline` as `tagline || truncate(bio)`, because the card DTO
 * deliberately doesn't carry `bio` (see `MemberCardDTO` in `members.api.ts`) — so
 * a stranger's browser has no bio to fall back to. This module is the frontend
 * half of the same rule, and it runs in exactly two places:
 *
 *   1. Demo mode, where there is no backend and the bio comes from the local
 *      member registry.
 *   2. The profile editor's live card preview, which must resolve the fallback
 *      from the member's unsaved draft.
 *
 * Keep the two halves in step. If the cut rule or the character limit changes
 * here, change it in the backend too — otherwise a member's preview quietly
 * stops matching the card strangers actually see, which is the one thing the
 * preview exists to prevent.
 */

/** Roughly the two lines `.mRole` clamps the card's blurb to at 13px. */
export const DIRECTORY_BLURB_MAX_CHARS = 120;

/** Trailing punctuation left dangling by a mid-sentence cut, dropped before the ellipsis. */
const DANGLING_PUNCTUATION = /[\s.,;:!?—–-]+$/;

/**
 * Collapse whitespace and cut `text` to at most `maxChars`, breaking on a word
 * boundary and marking the cut with an ellipsis. Text already within the limit is
 * returned whitespace-collapsed and otherwise untouched — no ellipsis.
 */
export function truncateAtWord(
  text: string,
  maxChars: number = DIRECTORY_BLURB_MAX_CHARS,
): string {
  const collapsed = text.trim().replace(/\s+/g, " ");
  if (collapsed.length <= maxChars) return collapsed;
  // Look one character past the limit so a cut landing exactly on a space still
  // counts the preceding word as whole rather than dropping it.
  const clipped = collapsed.slice(0, maxChars + 1);
  const lastSpaceIndex = clipped.lastIndexOf(" ");
  // A single word longer than the whole limit has no boundary to break on, so
  // cut it mid-word rather than returning an ellipsis on its own.
  const cut =
    lastSpaceIndex > 0
      ? clipped.slice(0, lastSpaceIndex)
      : collapsed.slice(0, maxChars);
  return `${cut.replace(DANGLING_PUNCTUATION, "")}…`;
}

/**
 * Resolve the blurb for a member's directory card. Returns "" when the member has
 * written neither a short bio nor a bio — the card then shows an empty line, which
 * is honest.
 */
export function directoryBlurb(
  tagline: string | undefined,
  bio: string | undefined,
): string {
  const trimmedTagline = (tagline ?? "").trim();
  if (trimmedTagline) return trimmedTagline;
  const trimmedBio = (bio ?? "").trim();
  return trimmedBio ? truncateAtWord(trimmedBio) : "";
}

/**
 * True when the card's blurb is being borrowed from the bio rather than written
 * as a short bio — the editor uses this to say so, so the fallback isn't invisible
 * magic to the member it's happening to.
 */
export function isBlurbBorrowedFromBio(
  tagline: string | undefined,
  bio: string | undefined,
): boolean {
  return !(tagline ?? "").trim() && !!(bio ?? "").trim();
}
