/** A tall, face-cropped portrait for the featured card (Unsplash-aware). */
export function portraitSrc(src?: string): string | undefined {
  if (!src) return undefined;
  if (!src.includes("unsplash.com")) return src;
  const url = new URL(src);
  url.searchParams.set("w", "640");
  url.searchParams.set("h", "800");
  url.searchParams.set("fit", "crop");
  url.searchParams.set("crop", "faces");
  url.searchParams.set("auto", "format");
  url.searchParams.set("q", "80");
  return url.toString();
}
