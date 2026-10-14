const MAX_START_DIGITS = 7;

/** "/studio/track?id=<id>" plus `t=<whole seconds>`, replacing an earlier
 *  `t`. The rest of the link stays exactly as written. */
export function trackLinkAt(trackHref: string, seconds: number): string {
  const wholeSeconds = Number.isFinite(seconds)
    ? Math.max(0, Math.floor(seconds))
    : 0;
  const hashIndex = trackHref.indexOf("#");
  const withoutHash =
    hashIndex === -1 ? trackHref : trackHref.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : trackHref.slice(hashIndex);
  const queryIndex = withoutHash.indexOf("?");
  const path =
    queryIndex === -1 ? withoutHash : withoutHash.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : withoutHash.slice(queryIndex + 1);
  const pairs = query
    .split("&")
    .filter((pair) => pair.length > 0 && !pair.startsWith("t="));
  pairs.push(`t=${wholeSeconds}`);
  return `${path}?${pairs.join("&")}${hash}`;
}

/** The track page's `t`: whole seconds from 1, clamped to one second before
 *  the end; null for anything else. The page never autoplays from it. */
export function parseStartSeconds(
  searchParams: URLSearchParams,
  durationSeconds: number | null,
): number | null {
  const raw = searchParams.get("t")?.trim() ?? "";
  if (!new RegExp(`^\\d{1,${MAX_START_DIGITS}}$`).test(raw)) return null;
  const requested = Number(raw);
  const ceiling =
    durationSeconds !== null && Number.isFinite(durationSeconds)
      ? Math.floor(durationSeconds) - 1
      : Number.POSITIVE_INFINITY;
  const clamped = Math.min(requested, ceiling);
  return clamped >= 1 ? clamped : null;
}
