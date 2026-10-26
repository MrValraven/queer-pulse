/** The source recorded when no campaign tag or outside referrer names one. */
export const DIRECT_LANDING_SOURCE = "direct";

const MAX_SOURCE_LENGTH = 64;

/**
 * Normalizes a raw source the same way the backend does: lower case, every
 * character outside `[a-z0-9._-]` becomes `-`, leading and trailing `-` are
 * trimmed, the result is clamped to 64 characters, and any trailing `-` the
 * clamp exposes is trimmed again. An empty result falls back to `direct`.
 */
export function normalizeLandingSource(rawSource: string): string {
  const normalizedSource = rawSource
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SOURCE_LENGTH)
    .replace(/-+$/, "");
  return normalizedSource.length > 0 ? normalizedSource : DIRECT_LANDING_SOURCE;
}

function stripWwwPrefix(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

/**
 * Where a landing visit came from, as one short label for the anonymous
 * visit counter. A `utm_source` query parameter wins; next comes the
 * referrer's hostname without `www.`, ignored when it is this site (with or
 * without `www.`); everything else, an unparseable referrer included, is
 * `direct`. Only the label leaves the browser: the path and query of the
 * referrer are never read.
 */
export function computeLandingSource(
  search: string,
  referrer: string,
  ownHost: string,
): string {
  const utmSource = new URLSearchParams(search).get("utm_source")?.trim();
  if (utmSource) return normalizeLandingSource(utmSource);

  if (!referrer) return DIRECT_LANDING_SOURCE;

  let referrerHostname: string;
  try {
    referrerHostname = new URL(referrer).hostname;
  } catch {
    return DIRECT_LANDING_SOURCE;
  }
  if (!referrerHostname) return DIRECT_LANDING_SOURCE;

  const ownHostname = ownHost.split(":")[0] ?? "";
  const isSameSite =
    stripWwwPrefix(referrerHostname) === stripWwwPrefix(ownHostname);
  if (isSameSite) return DIRECT_LANDING_SOURCE;

  return normalizeLandingSource(stripWwwPrefix(referrerHostname));
}
