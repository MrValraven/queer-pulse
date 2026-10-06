/**
 * Who owns and runs a business, in the owner's own words: women, trans people,
 * non-binary people, Black, Indigenous and people of colour (BIPOC). Any
 * combination, or none.
 *
 * These tags say something about the OWNER as a person, not about the
 * business, and saying one publicly can out them. So they are owner-personal
 * data (see `OWNER_PERSONAL_FIELDS`): only the owner ever sets them, a
 * co-manager neither sees nor sends them, a suggestion never carries them,
 * and staff never answer them on somebody's behalf. Nobody verifies them
 * either, so they are always shown as plain tags, never beside the verified
 * marks.
 *
 * The ids are the wire values the API stores and the `?owned=` filter sends;
 * labels resolve through `t()` only at render.
 */
export const LISTING_OWNED_BY = [
  "women",
  "trans",
  "nonbinary",
  "bipoc",
] as const;

export type ListingOwnedBy = (typeof LISTING_OWNED_BY)[number];

const OWNED_BY_SET: ReadonlySet<string> = new Set(LISTING_OWNED_BY);

/** The short tag, as the card, the detail page and the filter chip print it. */
export const OWNED_BY_TAG_KEYS: Record<ListingOwnedBy, string> = {
  women: "marketing:directory.ownedBy.women",
  trans: "marketing:directory.ownedBy.trans",
  nonbinary: "marketing:directory.ownedBy.nonbinary",
  bipoc: "marketing:directory.ownedBy.bipoc",
};

/**
 * Any list that claims to hold tags, cleaned into the canonical shape: known
 * ids only, each once, in `LISTING_OWNED_BY` order.
 *
 * Unknown ids are dropped rather than trusted. A newer server may know a tag
 * this build has no words for, and a hand-edited URL may carry a typo; the
 * endpoint 400s an unknown value, so none may ever be forwarded to it. The
 * fixed order means two equivalent lists compare equal and share a cache key.
 */
export function normalizeOwnedBy(raw: unknown): ListingOwnedBy[] {
  if (!Array.isArray(raw)) return [];
  const wanted = new Set(
    raw.filter(
      (value): value is string =>
        typeof value === "string" && OWNED_BY_SET.has(value),
    ),
  );
  return LISTING_OWNED_BY.filter((value) => wanted.has(value));
}

/** Add the tag when it is missing, remove it when present; canonical order. */
export function toggleOwnedBy(
  current: readonly ListingOwnedBy[],
  value: ListingOwnedBy,
): ListingOwnedBy[] {
  return current.includes(value)
    ? current.filter((entry) => entry !== value)
    : normalizeOwnedBy([...current, value]);
}
