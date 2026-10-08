/**
 * Decides whether an applicant's self-typed social profile is safe to render
 * as a link in the review queue. The value is attacker-controlled (the request
 * form is public), so only these become an href: an http(s) URL written with
 * `//` after the scheme, or a bare domain such as `instagram.com/ana` (which
 * gets `https://` in front). Either way the host must be dotted and
 * non-numeric, with no credentials and no backslashes anywhere in the value.
 * Handles (`@ana`), phrases, and every other scheme (`javascript:`, `data:`)
 * stay plain text.
 */
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;
const WEB_SCHEME_WITH_SLASHES = /^https?:\/\/[^\\]/i;
const BARE_DOMAIN = /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?(\?\S*)?$/i;
const NUMERIC_HOST = /^[\d.]+$/;

export function socialProfileHref(raw: string | null): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (value.length === 0 || /\s/.test(value) || value.includes("\\")) {
    return null;
  }
  let candidate: string | null = null;
  if (HAS_SCHEME.test(value)) {
    candidate = WEB_SCHEME_WITH_SLASHES.test(value) ? value : null;
  } else if (BARE_DOMAIN.test(value)) {
    candidate = `https://${value}`;
  }
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    const isWebProtocol = url.protocol === "http:" || url.protocol === "https:";
    if (!isWebProtocol || !url.hostname.includes(".")) return null;
    if (url.username || url.password) return null;
    if (NUMERIC_HOST.test(url.hostname) || url.hostname.startsWith("[")) {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}

/**
 * The visible link text is whatever the applicant typed, so an
 * internationalised look-alike host (a Cyrillic "і" in "instagram.com") reads
 * as the real site while the href carries its encoded form. This returns that
 * encoded host (any label starting with "xn--") so the reviewer sees where the
 * link really goes, and null when the host is plain ASCII or the href is not
 * parseable.
 */
export function encodedHostOf(href: string | null): string | null {
  if (!href) return null;
  try {
    const { hostname } = new URL(href);
    const hasEncodedLabel = hostname
      .split(".")
      .some((label) => label.toLowerCase().startsWith("xn--"));
    return hasEncodedLabel ? hostname : null;
  } catch {
    return null;
  }
}
