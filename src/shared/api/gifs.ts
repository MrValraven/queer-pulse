// GIF provider client. Google decommissioned the Tenor API (30 Jun 2026), so
// live GIF search runs on KLIPY (https://klipy.com) — lifetime-free, Tenor-shaped.
// The types here are provider-neutral (see `GifAttachment.provider`) so a future
// provider change never touches the message model or the UI.

export interface GifAttachment {
  url: string;
  previewUrl: string;
  width: number;
  height: number;
  /** Which service the GIF came from (e.g. "klipy"). Free-form on purpose —
   *  swapping providers must never require a schema or type change. */
  provider: string;
}

export interface GifResult {
  id: string;
  description: string;
  attachment: GifAttachment;
}

export interface GifSearchPage {
  results: GifResult[];
  /** The next page number to request, or null when there are no more results.
   *  (KLIPY paginates by 1-based page number, not a cursor.) */
  nextPage: number | null;
}

export interface GifProvider {
  featured(page?: number): Promise<GifSearchPage>;
  search(query: string, page?: number): Promise<GifSearchPage>;
}

const KLIPY_KEY = import.meta.env.VITE_KLIPY_KEY as string | undefined;

/** Whether a live GIF provider is configured. When false, live mode has no
 *  network provider (the KLIPY key is unset), so the picker shows a warm
 *  "coming soon" state instead of erroring. Demo mode never needs this — it
 *  serves the curated `DEMO_GIFS` and never touches the provider. */
export const isGifProviderConfigured = Boolean(KLIPY_KEY);

const KLIPY_BASE = "https://api.klipy.com/api/v1";
const PER_PAGE = 24;
// KLIPY's safest content rating (mirrors Tenor's high content filter) — always
// sent so the community never surfaces adult GIFs.
const SAFE_RATING = "g";

interface GifFileVariant {
  url?: string;
  width?: number;
  height?: number;
}

/**
 * A KLIPY size entry may be `{ url, width, height }` directly, or a wrapper of
 * per-format nodes like `{ gif: { url, width, height }, webp: {...} }`. This
 * reads whichever shape is present and returns the gif variant.
 *
 * NOTE: the exact `file`/`files` sub-shape is mapped defensively from KLIPY's
 * documented structure; confirm the field names against a live response once a
 * real API key is available (KLIPY offers a free 100-calls/hour test key).
 */
function readVariant(node: unknown): GifFileVariant | null {
  if (!node || typeof node !== "object") return null;
  const record = node as Record<string, unknown>;
  if (typeof record.url === "string") {
    return record as GifFileVariant;
  }
  const gif = record.gif;
  if (gif && typeof gif === "object" && typeof (gif as GifFileVariant).url === "string") {
    return gif as GifFileVariant;
  }
  return null;
}

/** Picks a variant from the item's size map, trying `preferredSizes` in order,
 *  then falling back to any variant that has a url. */
function pickVariant(
  files: Record<string, unknown>,
  preferredSizes: string[],
): GifFileVariant | null {
  for (const size of preferredSizes) {
    const variant = readVariant(files[size]);
    if (variant?.url) return variant;
  }
  for (const value of Object.values(files)) {
    const variant = readVariant(value);
    if (variant?.url) return variant;
  }
  return null;
}

function toGifResult(item: unknown): GifResult | null {
  if (!item || typeof item !== "object") return null;
  const record = item as Record<string, unknown>;
  const files = (record.file ?? record.files) as Record<string, unknown> | undefined;
  if (!files || typeof files !== "object") return null;
  // Full GIF prefers a larger size; the grid preview prefers a smaller one.
  const full = pickVariant(files, ["hd", "md", "sm", "xs"]);
  const preview = pickVariant(files, ["xs", "sm", "md", "hd"]) ?? full;
  if (!full?.url || !preview?.url) return null;
  const id =
    record.id != null
      ? String(record.id)
      : record.slug != null
        ? String(record.slug)
        : full.url;
  const title = typeof record.title === "string" ? record.title : "";
  return {
    id,
    description: title || "GIF",
    attachment: {
      url: full.url,
      previewUrl: preview.url,
      width: Number(full.width) || 0,
      height: Number(full.height) || 0,
      provider: "klipy",
    },
  };
}

async function fetchKlipyPage(
  path: "trending" | "search",
  extraParams: Record<string, string>,
): Promise<GifSearchPage> {
  if (!KLIPY_KEY) {
    throw new Error("VITE_KLIPY_KEY is not set");
  }
  const params = new URLSearchParams({
    per_page: String(PER_PAGE),
    rating: SAFE_RATING,
    ...extraParams,
  });
  // KLIPY carries the api key in the URL PATH, not a query param or header.
  const response = await fetch(
    `${KLIPY_BASE}/${KLIPY_KEY}/gifs/${path}?${params.toString()}`,
  );
  if (!response.ok) {
    throw new Error(`KLIPY request failed: ${response.status}`);
  }
  const payload = (await response.json()) as {
    data?: { data?: unknown[]; current_page?: number; has_next?: boolean };
  };
  const page = payload.data;
  const results = (page?.data ?? [])
    .map(toGifResult)
    .filter((result): result is GifResult => result !== null);
  const nextPage = page?.has_next ? (page.current_page ?? 1) + 1 : null;
  return { results, nextPage };
}

export const gifProvider: GifProvider = {
  featured: (page) =>
    fetchKlipyPage("trending", page ? { page: String(page) } : {}),
  search: (query, page) =>
    fetchKlipyPage(
      "search",
      page ? { q: query, page: String(page) } : { q: query },
    ),
};
