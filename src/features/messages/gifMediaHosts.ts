/**
 * SEC-24: the hosts a GIF bubble may load its image from. The server only
 * accepts KLIPY media (`queerpulse-backend/src/messaging/gif-media-hosts.ts`);
 * this is the render-side twin. A GIF stored before that rule, or one that
 * reached the client some other way, fires no request to a host a
 * counterpart picked. Tenor's media host stays allowed for the curated demo
 * GIFs (`demoGifs.data.ts`) and for GIFs sent while the picker still ran on
 * Tenor.
 */
const GIF_MEDIA_HOST_SUFFIXES = ["klipy.com", "media.tenor.com"];

export function isAllowedGifMediaUrl(candidate: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  if (parsed.username || parsed.password || parsed.port) return false;
  const hostname = parsed.hostname.toLowerCase();
  return GIF_MEDIA_HOST_SUFFIXES.some(
    (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`),
  );
}

/** The url a GIF may render from, or null when its host is refused. Any
 *  other kind passes through untouched. */
export function renderableGifUrl(
  kind: string | undefined,
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  if (kind !== "gif") return url;
  return isAllowedGifMediaUrl(url) ? url : null;
}

/** A reply quote with its GIF thumbnail dropped when the host is refused, so
 *  the quote shows the GIF label alone and fires no request. */
export function withRenderableGifThumbnail<
  Source extends { kind: string; thumbnailUrl: string | null },
>(source: Source): Source {
  const thumbnailUrl = renderableGifUrl(source.kind, source.thumbnailUrl);
  return thumbnailUrl === source.thumbnailUrl
    ? source
    : { ...source, thumbnailUrl };
}
