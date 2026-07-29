/**
 * Rewrites an Unsplash cover URL's `w=` query param to `targetWidth`, so a
 * poster variant rendered at a small CSS size (e.g. the ~40px `compact`
 * thumb) doesn't download the same 1200px-wide image as the hero lead.
 * Non-Unsplash URLs, URLs without a `w=` param, and `undefined` all pass
 * through untouched — this never throws on odd input.
 */
export function sizedCover(url: string | undefined, targetWidth: number): string | undefined {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith("images.unsplash.com")) return url;
    if (!parsed.searchParams.has("w")) return url;
    parsed.searchParams.set("w", String(Math.round(targetWidth)));
    return parsed.toString();
  } catch {
    return url;
  }
}
