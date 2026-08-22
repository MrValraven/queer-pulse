/**
 * Normalise a Google-hosted image URL so it renders crisply at roughly `px`
 * device pixels.
 *
 * Google/OAuth images (`lh3.googleusercontent.com`, `*.ggpht.com`) carry a size
 * directive at the end of the path. Two shapes show up:
 *   - avatars: a small `=s96-c` square crop, and
 *   - place photos (Maps/Directory): a compound `=s680-w680-h510-rw` bound.
 * Both cap the served resolution well below what a large hero or full-width
 * preview needs, so upscaling them in the browser looks blurry. We rewrite the
 * ENTIRE directive to a single longest-edge bound `=s${size}`.
 *
 * Replacing the whole directive (rather than only the leading `=s\d+` token)
 * matters: on `=s680-w680-h510-rw` the leftover `-w680-h510` would otherwise
 * keep the image pinned at 680px. We deliberately drop any `-c` square crop and
 * `-w/-h` caps — `=s${size}` bounds the longer edge while preserving aspect
 * ratio, which is right for both a circular avatar (CSS `object-fit: cover`
 * still crops it) and a wide hero (which must not be squished). Google never
 * upscales past the original, so requesting generously is safe.
 *
 * Unsplash images (`images.unsplash.com`, `plus.unsplash.com`) carry their
 * render width in a `?w=` query param. Seed/mock data authored these at a
 * grab-bag of widths (600, 687, 800, 1170…), so a photo dropped into a large
 * slot — the 340×430 profile hero, a work-image card — is served at whatever
 * width it happened to be authored with and upscaled by the browser. That's
 * the "sometimes blurry" you get when one member's portrait is razor-sharp and
 * the next is soft: it's purely which `w=` the URL carried. We rewrite `w` (and
 * `h`, when present) UP to the requested `px` — raise-only, so a caller passing
 * a small default `px` can never DOWN-size an already-large URL and make it
 * worse. Unsplash never upscales past the source (these originals are 4000px+),
 * so requesting generously is safe.
 *
 * URLs from any other host are returned untouched, so this is safe to call on
 * any `src` — including non-Google/Unsplash images (event covers, magazine art)
 * that flow through the same components.
 *
 * Pair it with `referrerPolicy="no-referrer"` on the `<img>`: Google's image
 * CDN can answer 403/429 when the request carries a `Referer`.
 */
export function resolveAvatarSrc(
  src: string | undefined,
  px = 256,
  options?: {
    /**
     * Ask Unsplash for a square, face-aware crop at exactly `px` instead of the
     * raise-only width bump. Used by `<Avatar>`, where an off-centre or blurry
     * crop is very visible at 32-48px. Non-Unsplash hosts ignore it.
     */
    isFaceCrop?: boolean;
  },
): string | undefined {
  if (!src) return src;
  const size = Math.max(1, Math.round(px));
  if (/(?:images|plus)\.unsplash\.com/.test(src)) {
    return normalizeUnsplashSrc(src, size, options?.isFaceCrop ?? false);
  }
  if (!/googleusercontent\.com|ggpht\.com/.test(src)) return src;
  // Older URLs use a `?sz=96` query param.
  if (/[?&]sz=\d+/.test(src)) return src.replace(/([?&]sz=)\d+/, `$1${size}`);
  // Newer URLs end in an `=` directive: `=s96-c`, `=s680-w680-h510-rw`, `=w512`…
  // (a token starting with a letter, then dash-joined option tokens). Anchored
  // to the end so a base64 file id — which never contains this shape — is left
  // alone.
  const directive = /=[a-z]\d*(?:-[a-z0-9]+)*$/i;
  if (directive.test(src)) return src.replace(directive, `=s${size}`);
  // Directive-LESS Google avatar (`.../a/ACg8ocK…` with no `=s` token) — a shape
  // Google's OIDC `picture` claim sometimes returns. With no size token Google
  // serves its small default (~s96), so a large slot upscales it into a blurry
  // hero. Append `=s${size}` to request a crisp render. Only when there's no
  // query string (an `=s` suffix belongs on the path, not after a `?`).
  if (!src.includes("?")) return `${src}=s${size}`;
  return src;
}

/**
 * Bump an Unsplash URL's `w`/`h` render params UP to at least `size`, preserving
 * every other param (`fit`, `crop`, `auto`, `q`, `ixid`…). Raise-only: an
 * existing width larger than `size` is left alone, so a caller passing a small
 * default never softens an already-generous URL. Also ensures `auto=format`
 * (modern codecs) is set. Returns the input unchanged if it can't be parsed.
 */
function normalizeUnsplashSrc(
  src: string,
  size: number,
  isFaceCrop = false,
): string {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return src;
  }
  if (isFaceCrop) {
    // A square, face-aware crop at exactly `size` — what an avatar circle
    // wants. `<Avatar>` used to build this inline with a bare `new URL(src)`,
    // which THREW during render on a malformed src containing "unsplash.com".
    url.searchParams.set("w", String(size));
    url.searchParams.set("h", String(size));
    url.searchParams.set("fit", "crop");
    url.searchParams.set("crop", "faces");
    url.searchParams.set("auto", "format");
    url.searchParams.set("q", "80");
    return url.toString();
  }
  const raise = (param: "w" | "h") => {
    const current = Number(url.searchParams.get(param));
    if (!Number.isFinite(current) || current < size) {
      url.searchParams.set(param, String(size));
    }
  };
  raise("w");
  // Only touch `h` when the URL already constrains height (a square/fixed crop);
  // width-only URLs stay width-bound so the aspect ratio is preserved.
  if (url.searchParams.has("h")) raise("h");
  if (!url.searchParams.has("auto")) url.searchParams.set("auto", "format");
  return url.toString();
}
