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
 * URLs from any other host are returned untouched, so this is safe to call on
 * any `src` — including non-Google images (event covers, magazine art) that
 * flow through the same components.
 *
 * Pair it with `referrerPolicy="no-referrer"` on the `<img>`: Google's image
 * CDN can answer 403/429 when the request carries a `Referer`.
 */
export function resolveAvatarSrc(
  src: string | undefined,
  px = 256,
): string | undefined {
  if (!src) return src;
  if (!/googleusercontent\.com|ggpht\.com/.test(src)) return src;
  const size = Math.max(1, Math.round(px));
  // Older URLs use a `?sz=96` query param.
  if (/[?&]sz=\d+/.test(src)) return src.replace(/([?&]sz=)\d+/, `$1${size}`);
  // Newer URLs end in an `=` directive: `=s96-c`, `=s680-w680-h510-rw`, `=w512`…
  // (a token starting with a letter, then dash-joined option tokens). Anchored
  // to the end so a base64 file id — which never contains this shape — is left
  // alone.
  const directive = /=[a-z]\d*(?:-[a-z0-9]+)*$/i;
  if (directive.test(src)) return src.replace(directive, `=s${size}`);
  return src;
}
