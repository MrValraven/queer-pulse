/**
 * `facets` on the first page of `GET /directory?page=`: how many listings each
 * filter option would show, counted under every other filter of the request.
 * Mirrors the backend's `DirectoryFacetCounts`. Every record carries every
 * value of its vocabulary, so a 0 is a real answer.
 *
 * Open now is not here: the browser works it out on each place's own clock,
 * and this read is CDN-cached (see `isPlaceOpenNow`).
 */
export interface DirectoryFacetCountsDTO {
  /** Per category chip of the request's vocabulary, on the primary category. */
  categories: Record<string, number>;
  /** "All": the categories lifted. Its own total, never a sum. */
  allCategories: number;
  /** With "Verified safe spaces" on. */
  safe: number;
  /** With "Out and about" on. */
  outAndAbout: number;
  /** Per owner tag, the tags lifted (an OR). */
  owned: Record<string, number>;
  /** Per access need, added to the ones already ticked. */
  access: Record<string, number>;
  /** Per way in, the chosen one lifted (one choice). */
  entryModes: Record<string, number>;
  /** Per way to pay, added to the ones already picked. */
  payments: Record<string, number>;
  /** Per language, the languages lifted (an OR). */
  languages: Record<string, number>;
  /** Per inclusion practice, added to the ones already picked. */
  practices: Record<string, number>;
  /** Per filterable attribute, added to the ones already picked. */
  attributes: Record<string, number>;
}

const COUNT_RECORD_KEYS = [
  "categories",
  "owned",
  "access",
  "entryModes",
  "payments",
  "languages",
  "practices",
  "attributes",
] as const;

const COUNT_KEYS = ["allCategories", "safe", "outAndAbout"] as const;

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isCountRecord(value: unknown): value is Record<string, number> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every(isCount)
  );
}

/**
 * The facets off a page response, or undefined when there are none: a later
 * page (the server counts on page 1 alone), a server that predates them, or a
 * block that does not hold the expected shape. Undefined reads as "not
 * counted" downstream, which never draws as a 0.
 */
export function readDirectoryFacets(
  response: unknown,
): DirectoryFacetCountsDTO | undefined {
  if (typeof response !== "object" || response === null) return undefined;
  if (Array.isArray(response)) return undefined;
  const facets = (response as { facets?: unknown }).facets;
  if (typeof facets !== "object" || facets === null) return undefined;
  const block = facets as Record<string, unknown>;
  const isWellFormed =
    COUNT_KEYS.every((key) => isCount(block[key])) &&
    COUNT_RECORD_KEYS.every((key) => isCountRecord(block[key]));
  return isWellFormed ? (facets as DirectoryFacetCountsDTO) : undefined;
}
