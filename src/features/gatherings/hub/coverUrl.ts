/**
 * Rewrites an Unsplash cover URL's `w=` query param to `targetWidth`, so a
 * poster variant rendered at a small CSS size (e.g. the ~40px `compact`
 * thumb) doesn't download the same 1200px-wide image as the hero lead.
 * When the URL also carries an `h=` param (a cropped cover such as a
 * 1080x1350 portrait poster), `h` scales by the same factor, rounded, so the
 * requested aspect ratio is kept. Non-Unsplash URLs, URLs without a `w=`
 * param, and `undefined` all pass through untouched; this never throws on
 * odd input.
 */
export function sizedCover(
  url: string | undefined,
  targetWidth: number,
): string | undefined {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith("images.unsplash.com")) return url;
    if (!parsed.searchParams.has("w")) return url;
    const originalWidth = Number(parsed.searchParams.get("w"));
    const roundedWidth = Math.round(targetWidth);
    parsed.searchParams.set("w", String(roundedWidth));
    const originalHeight = Number(parsed.searchParams.get("h"));
    const hasScalableHeight =
      parsed.searchParams.has("h") &&
      originalWidth > 0 &&
      Number.isFinite(originalWidth) &&
      originalHeight > 0 &&
      Number.isFinite(originalHeight);
    if (hasScalableHeight) {
      const scaledHeight = Math.max(
        1,
        Math.round((originalHeight * roundedWidth) / originalWidth),
      );
      parsed.searchParams.set("h", String(scaledHeight));
    }
    return parsed.toString();
  } catch {
    return url;
  }
}
