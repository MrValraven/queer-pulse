/**
 * Normalise a profile/avatar image URL so it renders crisply at roughly `px`
 * device pixels.
 *
 * Google/OAuth avatars (`lh3.googleusercontent.com`, `*.ggpht.com`) ship a small
 * `=s96-c` crop by default, which looks blurry when scaled up into a larger
 * circle. We rewrite the size directive to request a bigger source. URLs from
 * any other host are returned untouched, so this is safe to call on any `src`
 * — including non-avatar images (event covers, magazine art) that happen to
 * flow through the same components.
 *
 * Pair it with `referrerPolicy="no-referrer"` on the `<img>`: Google's avatar
 * CDN can answer 403/429 when the request carries a `Referer`.
 */
export function resolveAvatarSrc(
  src: string | undefined,
  px = 256,
): string | undefined {
  if (!src) return src;
  if (/googleusercontent\.com|ggpht\.com/.test(src)) {
    const size = Math.max(1, Math.round(px));
    // Newer URLs encode size as an `=s96-c` directive...
    if (/=s\d+/.test(src)) return src.replace(/=s\d+/, `=s${size}`);
    // ...older ones use a `?sz=96` query param.
    if (/[?&]sz=\d+/.test(src)) return src.replace(/([?&]sz=)\d+/, `$1${size}`);
  }
  return src;
}
